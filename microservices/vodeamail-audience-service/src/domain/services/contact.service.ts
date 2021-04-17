import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder, buildFindOneQueryBuilder } from 'vnest-core';
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
import { ContactGroup } from '../entities/contact-group.entity';

export const existsQuery = <T>(builder: SelectQueryBuilder<T>) =>
  `exists (${builder.getQuery()})`;

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactGroup)
    private readonly contactGroupRepository: Repository<ContactGroup>,
    @Inject('AUDIENCE_GROUP_SERVICE')
    private readonly groupService: GroupService,
  ) {}

  async findAll(options: FindAllContactDto): Promise<Contact[]> {
    const qb = this.contactRepository
      .createQueryBuilder('contacts')
      .leftJoin(
        'summary_contacts',
        'summary_contacts',
        '(summary_contacts.contact_id = contacts.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return builder.execute();
  }

  async findAllCount(options: FindAllGroupDto): Promise<number> {
    const qb = this.contactRepository
      .createQueryBuilder('contacts')
      .leftJoin(
        'summary_contacts',
        'summary_contacts',
        '(summary_contacts.contact_id = contacts.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return builder.getCount();
  }

  async findOne(options: FindOneContactDto): Promise<Contact> {
    const qb = this.contactRepository.createQueryBuilder('contacts');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindOneQueryBuilder(qb, options), options),
      options,
    );

    return builder.execute();
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

    const contactGroups = [];
    for (const group of groups) {
      contactGroups.push(
        this.contactGroupRepository.create({
          group_id: group.id,
        }),
      );
    }

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
        contact_groups: contactGroups,
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

    const contactGroups = [];
    for (const group of groups) {
      contactGroups.push(
        this.contactGroupRepository.create({
          group_id: group.id,
        }),
      );
    }

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
      contact_groups: contactGroups,
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

  protected makeFilter(
    builder: any,
    options: FindOneContactDto | FindAllContactDto,
  ) {
    const {
      organization_id: organizationId,
      is_subscribed: isSubscribed,
      group_id: groupId,
      group_ids: groupIds,
    } = options;

    builder.where(
      new Brackets((qb) => {
        qb.where('contacts.organization_id = :organizationId', {
          organizationId,
        }).orWhere('contacts.organization_id IS NULL');
      }),
    );

    if (isSubscribed !== undefined) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('contacts.is_subscribed = :isSubscribed', { isSubscribed });
        }),
      );
    }

    const filterGroupIds = groupId === undefined ? [] : [groupId];
    if (groupIds !== undefined) {
      filterGroupIds.push(...groupIds);
    }

    if (filterGroupIds.length) {
      builder.where(
        existsQuery(
          this.contactGroupRepository
            .createQueryBuilder('contact_groups')
            .where('contact_groups.contact_id = contacts.id')
            .where({
              group_id: In(filterGroupIds),
            }),
        ),
      );
    }

    return builder;
  }

  protected makeSearchable(builder: any, { search }: FindAllContactDto) {
    if (search) {
      const params = { search: `%${search}%` };
      builder.where(
        new Brackets((qb) => {
          qb.where('contacts.email LIKE :search', params)
            .orWhere('contacts.name LIKE :search', params)
            .orWhere('summary_contacts.total_group LIKE :search', params);
        }),
      );
    }

    return builder;
  }
}
