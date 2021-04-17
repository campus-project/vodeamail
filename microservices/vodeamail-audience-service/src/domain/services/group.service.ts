import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder } from 'vnest-core';
import { RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';

import {
  CreateGroupDto,
  DeleteGroupDto,
  FindAllGroupDto,
  FindOneGroupDto,
  UpdateGroupDto,
} from '../../application/dtos/group.dto';
import { Group } from '../entities/group.entity';
import { ContactGroup } from '../entities/contact-group.entity';
import { Contact } from '../entities/contact.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(ContactGroup)
    private readonly contactGroupRepository: Repository<ContactGroup>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async findAll(options: FindAllGroupDto): Promise<Group[]> {
    const { relations } = options;
    const qb = this.groupRepository
      .createQueryBuilder('groups')
      .select('groups.*')
      .addSelect('summary_groups.total_contact', 'total_contact')
      .leftJoin(
        'summary_groups',
        'summary_groups',
        '(summary_groups.group_id = groups.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    let data = await builder.execute();

    //relations
    if (relations !== undefined && relations.length) {
      const groupIds = [];

      const relationValues = {
        contactGroups: undefined,
      };

      data.forEach((group) => {
        groupIds.push(group.id);
      });

      //groups
      if (relations.indexOf('contacts') !== -1) {
        relationValues.contactGroups = await this.contactGroupRepository.find({
          where: { group_id: In([...new Set(groupIds)]) },
          relations: ['contact'],
        });
      }

      data = data.map((group) => {
        if (relationValues.contactGroups !== undefined) {
          const contacts = [];
          relationValues.contactGroups.forEach((contactGroup) => {
            if (contactGroup.group_id === group.id) {
              contacts.push(contactGroup.contact);
            }
          });

          group.contacts = contacts;
        }

        return group;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllGroupDto): Promise<number> {
    const qb = this.groupRepository
      .createQueryBuilder('groups')
      .leftJoin(
        'summary_groups',
        'summary_groups',
        '(summary_groups.group_id = groups.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneGroupDto): Promise<Group> {
    const data = await this.findAll(options);

    return _.head(data);
  }

  @Transactional()
  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const {
      id,
      organization_id,
      name,
      description,
      is_visible,
      contact_ids,
      actor_id: created_by,
    } = createGroupDto;

    const contacts = await this.contactRepository.find({
      where: {
        id: In([...new Set(contact_ids)]),
        organization_id,
      },
    });

    const group = await this.groupRepository.save(
      this.groupRepository.create({
        id,
        organization_id,
        name,
        description,
        is_visible,
        contacts,
        created_by,
        updated_by: created_by,
      }),
    );

    return this.findOne({
      id: group.id,
      organization_id,
    });
  }

  @Transactional()
  async update(updateGroupDto: UpdateGroupDto): Promise<Group> {
    const {
      id,
      organization_id,
      name,
      description,
      is_visible,
      contact_ids,
      actor_id: updated_by,
    } = updateGroupDto;

    const group = await this.groupRepository.findOne({
      where: { id, organization_id },
    });

    if (!group) {
      throw new RpcException(`Count not find resource ${id}`);
    }

    const contacts = await this.contactRepository.find({
      where: {
        id: In([...new Set(contact_ids)]),
        organization_id,
      },
    });

    Object.assign(group, {
      organization_id,
      name,
      description,
      is_visible,
      contacts,
      updated_by,
    });

    await this.groupRepository.save(group);

    return this.findOne({
      id: group.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(deleteGroupDto: DeleteGroupDto): Promise<number> {
    const {
      id,
      ids,
      is_hard,
      organization_id,
      actor_id: deleted_by,
    } = deleteGroupDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const groups = await this.groupRepository.find({
      where: {
        id: In(toBeDeleteIds),
        organization_id,
      },
    });

    if (is_hard) {
      await this.groupRepository.remove(groups);
    } else {
      await this.groupRepository.save(
        groups.map((group) => {
          Object.assign(group, {
            deleted_by,
            deleted_at: new Date().toISOString(),
          });

          return group;
        }),
      );
    }

    return groups.length;
  }

  protected makeFilter(
    builder: SelectQueryBuilder<Group>,
    options: FindOneGroupDto | FindAllGroupDto,
  ) {
    const {
      organization_id: organizationId,
      is_visible: isVisible,
      contact_id: contactId,
      contact_ids: contactIds,
    } = options;

    builder.andWhere(
      new Brackets((qb) => {
        qb.where('groups.organization_id = :organizationId', {
          organizationId,
        }).orWhere('groups.organization_id IS NULL');
      }),
    );

    if (isVisible !== undefined) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('groups.is_visible = :isVisible', { isVisible });
        }),
      );
    }

    const filterContactIds = contactId === undefined ? [] : [contactId];
    if (contactIds !== undefined) {
      filterContactIds.push(...contactIds);
    }

    if (filterContactIds.length) {
      const queryExists = this.contactGroupRepository
        .createQueryBuilder('contact_groups')
        .where('contact_groups.group_id = groups.id')
        .andWhere('contact_groups.contact_id IN (:...filterContactIds)', {
          filterContactIds,
        });

      builder.andWhere(
        `EXISTS (${queryExists.getQuery()})`,
        queryExists.getParameters(),
      );
    }

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<Group>,
    { search }: FindAllGroupDto,
  ) {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('groups.name LIKE :search', params).orWhere(
            'summary_groups.total_contact LIKE :search',
            params,
          );
        }),
      );
    }

    return builder;
  }
}
