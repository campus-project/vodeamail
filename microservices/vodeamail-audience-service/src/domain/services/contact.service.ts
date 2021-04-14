import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In, IsNull, Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryOption, buildFindOneQueryOption } from 'vnest-core';
import {
  CreateContactDto,
  DeleteContactDto,
  FindAllContactDto,
  FindOneContactDto,
  UpdateContactDto,
} from '../../application/dtos/contact.dto';
import { RpcException } from '@nestjs/microservices';
import { GroupService } from './group.service';
import { FindAllGroupDto } from '../../application/dtos/group.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @Inject('AUDIENCE_GROUP_SERVICE')
    private readonly groupService: GroupService,
  ) {}

  async findAll(options: FindAllContactDto): Promise<Contact[]> {
    const { search } = options;
    const queryBuilder = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    if (search) {
      const whereClause = queryBuilder.where;
      queryBuilder.where = new Brackets((qb) => {
        Object.keys(whereClause).forEach((key, index) => {
          qb.where({ [key]: whereClause[key] });
        });

        qb.where(
          new Brackets((qb1) => {
            qb1.where('`email` LIKE ' + `"%${search}%"`);
          }),
        );
      });
    }

    return await this.contactRepository.find(queryBuilder);
  }

  async findAllCount(options: FindAllGroupDto): Promise<number> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.contactRepository
      .createQueryBuilder('contacts')
      .leftJoin(
        'summary_contacts',
        'summary_contacts',
        '(summary_contacts.contact_id = contacts.id)',
      )
      .where(where)
      .cache(cache)
      .take(take)
      .skip(skip);

    if (withDeleted) {
      builder.withDeleted();
    }

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('`contacts`.`email` LIKE ' + `"%${search}%"`).orWhere(
            '`summary_contacts`.`total_group` LIKE ' + `"%${search}%"`,
          );
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(options: FindAllGroupDto): Promise<Contact[]> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, order, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.contactRepository
      .createQueryBuilder('contacts')
      .select('contacts.*')
      .addSelect('total_group')
      .leftJoin(
        'summary_contacts',
        'summary_contacts',
        '(summary_contacts.contact_id = contacts.id)',
      )
      .where(where)
      .cache(cache)
      .orderBy(order)
      .take(take)
      .skip(skip);

    if (withDeleted) {
      builder.withDeleted();
    }

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('`contacts`.`email` LIKE ' + `"%${search}%"`).orWhere(
            '`summary_contacts`.`total_group` LIKE ' + `"%${search}%"`,
          );
        }),
      );
    }

    return builder.execute();
  }

  async findOne(options: FindOneContactDto): Promise<Contact> {
    const queryBuilder = this.buildFindQuery(
      buildFindOneQueryOption({ options }),
      options,
    );

    return await this.contactRepository.findOne(queryBuilder);
  }

  @Transactional()
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const {
      id,
      organization_id,
      email,
      name,
      mobile_phone,
      address_line_1,
      address_line_2,
      country,
      province,
      city,
      postal_code,
      group_ids,
      actor_id: created_by,
    } = createContactDto;

    const groups = await this.groupService.findAll({
      ids: group_ids,
      organization_id,
    });

    const contact = await this.contactRepository.save(
      this.contactRepository.create({
        id,
        organization_id,
        email,
        name,
        mobile_phone,
        address_line_1,
        address_line_2,
        country,
        province,
        city,
        postal_code,
        groups,
        created_by,
        updated_by: created_by,
      }),
    );

    return this.findOne({
      id: contact.id,
      organization_id,
    });
  }

  @Transactional()
  async update(updateContactDto: UpdateContactDto): Promise<Contact> {
    const {
      id,
      organization_id,
      email,
      name,
      mobile_phone,
      address_line_1,
      address_line_2,
      country,
      province,
      city,
      postal_code,
      group_ids,
      actor_id: updated_by,
    } = updateContactDto;

    const contact = await this.findOne({ id, organization_id });
    if (!contact) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    const groups = await this.groupService.findAll({
      ids: group_ids,
      organization_id,
    });

    Object.assign(contact, {
      organization_id,
      email,
      name,
      mobile_phone,
      address_line_1,
      address_line_2,
      country,
      province,
      city,
      postal_code,
      groups,
      updated_by,
    });

    await this.contactRepository.save(contact);

    return this.findOne({
      id: contact.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(deleteContactDto: DeleteContactDto): Promise<number> {
    const {
      id,
      ids,
      is_hard,
      organization_id,
      actor_id: deleted_by,
    } = deleteContactDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const contacts = await this.contactRepository.find({
      where: {
        id: In(toBeDeleteIds),
        organization_id,
      },
    });

    if (is_hard) {
      await this.contactRepository.remove(contacts);
    } else {
      await this.contactRepository.save(
        contacts.map((contact) => {
          Object.assign(contact, {
            deleted_by,
            deleted_at: new Date().toISOString(),
          });

          return contact;
        }),
      );
    }

    return contacts.length;
  }

  protected buildFindQuery(
    queryBuilder,
    options: FindOneContactDto | FindAllContactDto,
  ) {
    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    if (options.group_id !== undefined) {
      Object.assign(queryBuilder.where, {
        group_id: options.group_id,
      });
    }

    if (options.group_ids !== undefined) {
      Object.assign(queryBuilder.where, {
        group_ids: In(options.group_ids),
      });
    }

    return queryBuilder;
  }
}
