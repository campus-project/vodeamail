import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder } from 'vnest-core';
import { RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';

import {
  CreateContactDto,
  DeleteContactDto,
  FindAllContactDto,
  FindOneContactDto,
  UpdateContactDto,
} from '../../application/dtos/contact.dto';
import { Contact } from '../entities/contact.entity';
import { Group } from '../entities/group.entity';
import { FindAllGroupDto } from '../../application/dtos/group.dto';
import { ContactGroup } from '../entities/contact-group.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactGroup)
    private readonly contactGroupRepository: Repository<ContactGroup>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async findAll(options: FindAllContactDto): Promise<Contact[]> {
    const { relations } = options;
    const qb = this.contactRepository
      .createQueryBuilder('contacts')
      .select('contacts.*')
      .addSelect('summary_contacts.total_group', 'total_group')
      .leftJoin(
        'summary_contacts',
        'summary_contacts',
        '(summary_contacts.contact_id = contacts.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    let data = await builder.execute();

    //relations
    if (relations !== undefined && relations.length) {
      const contactIds = [];

      const relationValues = {
        contactGroups: undefined,
      };

      data.forEach((contact) => {
        contactIds.push(contact.id);
      });

      //groups
      if (relations.indexOf('groups') !== -1) {
        relationValues.contactGroups = await this.contactGroupRepository.find({
          where: { contact_id: In([...new Set(contactIds)]) },
          relations: ['group'],
        });
      }

      data = data.map((contact) => {
        if (relationValues.contactGroups !== undefined) {
          const groups = [];
          relationValues.contactGroups.forEach((contactGroup) => {
            if (contactGroup.contact_id === contact.id) {
              groups.push(contactGroup.group);
            }
          });

          contact.groups = groups;
        }

        return contact;
      });
    }

    return data;
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

    return await builder.getCount();
  }

  async findOne(options: FindOneContactDto): Promise<Contact> {
    const data = await this.findAll(options);

    return _.head(data);
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

    const groups = await this.groupRepository.find({
      where: {
        id: In([...new Set(group_ids)]),
        organization_id,
      },
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

    const contact = await this.contactRepository.findOne({
      where: { id, organization_id },
    });

    if (!contact) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    const groups = await this.groupRepository.find({
      where: {
        id: In([...new Set(group_ids)]),
        organization_id,
      },
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

  protected makeFilter(
    builder: SelectQueryBuilder<Contact>,
    options: FindOneContactDto | FindAllContactDto,
  ) {
    const {
      organization_id: organizationId,
      is_subscribed: isSubscribed,
      group_id: groupId,
      group_ids: groupIds,
    } = options;

    builder.andWhere(
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
      const queryExists = this.contactGroupRepository
        .createQueryBuilder('contact_groups')
        .where('contact_groups.contact_id = contacts.id')
        .andWhere('contact_groups.group_id IN (:...filterGroupIds)', {
          filterGroupIds,
        });

      builder.andWhere(
        `EXISTS (${queryExists.getQuery()})`,
        queryExists.getParameters(),
      );
    }

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<Contact>,
    { search }: FindAllContactDto,
  ) {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
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
