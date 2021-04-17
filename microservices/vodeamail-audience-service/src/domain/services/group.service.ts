import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Brackets, In, Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder, buildFindOneQueryBuilder } from 'vnest-core';
import {
  CreateGroupDto,
  DeleteGroupDto,
  FindAllGroupDto,
  FindOneGroupDto,
  UpdateGroupDto,
} from '../../application/dtos/group.dto';
import { RpcException } from '@nestjs/microservices';
import { ContactService } from './contact.service';
import { ContactGroup } from '../entities/contact-group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(ContactGroup)
    private readonly contactGroupRepository: Repository<ContactGroup>,
    @Inject(forwardRef(() => 'AUDIENCE_CONTACT_SERVICE'))
    private readonly contactService: ContactService,
  ) {}

  async findAll(options: FindAllGroupDto): Promise<Group[]> {
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

    return builder.execute();
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

    return builder.getCount();
  }

  async findOne(options: FindOneGroupDto): Promise<Group> {
    const qb = this.groupRepository.createQueryBuilder('groups');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindOneQueryBuilder(qb, options), options),
      options,
    );

    return builder.execute();
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

    const contacts = await this.contactService.findAll({
      ids: contact_ids,
      organization_id,
    });

    const contactGroups = [];
    contacts.forEach((contact) => {
      contactGroups.push(
        this.contactGroupRepository.create({
          contact_id: contact.id,
        }),
      );
    });

    const group = await this.groupRepository.save(
      this.groupRepository.create({
        id,
        organization_id,
        name,
        description,
        is_visible,
        contact_groups: contactGroups,
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

    const group = await this.findOne({ id, organization_id });
    if (!group) {
      throw new RpcException(`Count not find resource ${id}`);
    }

    const contacts = await this.contactService.findAll({
      ids: contact_ids,
      organization_id,
    });

    const contactGroups = [];
    contacts.forEach((contact) => {
      contactGroups.push(
        this.contactGroupRepository.create({
          contact_id: contact.id,
        }),
      );
    });

    Object.assign(group, {
      organization_id,
      name,
      description,
      is_visible,
      contact_groups: contactGroups,
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
    builder: any,
    options: FindOneGroupDto | FindAllGroupDto,
  ) {
    const { organization_id: organizationId, is_visible: isVisible } = options;

    builder.where(
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

    return builder;
  }

  protected makeSearchable(builder: any, { search }: FindAllGroupDto) {
    if (search) {
      const params = { search: `%${search}%` };
      builder.where(
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
