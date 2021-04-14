import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Brackets, In, IsNull, Like, Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  buildFindAllQueryOption,
  buildFindOneQueryOption,
} from '../../@vodea/typeorm';
import {
  CreateGroupDto,
  DeleteGroupDto,
  FindAllGroupDto,
  FindOneGroupDto,
  UpdateGroupDto,
} from '../../application/dtos/group.dto';
import { RpcException } from '@nestjs/microservices';
import { ContactService } from './contact.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @Inject(forwardRef(() => 'AUDIENCE_CONTACT_SERVICE'))
    private readonly contactService: ContactService,
  ) {}

  async findAll(options: FindAllGroupDto): Promise<Group[]> {
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
            qb1.where('`name` LIKE ' + `"%${search}%"`);
          }),
        );
      });
    }

    return await this.groupRepository.find(queryBuilder);
  }

  async findAllCount(options: FindAllGroupDto): Promise<number> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.groupRepository
      .createQueryBuilder('groups')
      .leftJoin(
        'summary_groups',
        'summary_groups',
        '(summary_groups.group_id = groups.id)',
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
          qb.where('`groups`.`name` LIKE ' + `"%${search}%"`).orWhere(
            '`summary_groups`.`total_group` LIKE ' + `"%${search}%"`,
          );
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(options: FindAllGroupDto): Promise<Group[]> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, order, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.groupRepository
      .createQueryBuilder('groups')
      .select('groups.*')
      .addSelect('total_contact')
      .leftJoin(
        'summary_groups',
        'summary_groups',
        '(summary_groups.group_id = groups.id)',
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
          qb.where('`groups`.`name` LIKE ' + `"%${search}%"`).orWhere(
            '`summary_groups`.`total_group` LIKE ' + `"%${search}%"`,
          );
        }),
      );
    }

    return builder.execute();
  }

  async findOne(options: FindOneGroupDto): Promise<Group> {
    const queryBuilder = this.buildFindQuery(
      buildFindOneQueryOption({ options }),
      options,
    );

    return await this.groupRepository.findOne(queryBuilder);
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

    const group = await this.findOne({ id, organization_id });
    if (!group) {
      throw new RpcException(`Count not find resource ${id}`);
    }

    const contacts = await this.contactService.findAll({
      ids: contact_ids,
      organization_id,
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

  protected buildFindQuery(
    queryBuilder,
    options: FindOneGroupDto | FindAllGroupDto,
  ) {
    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    if (options.is_visible !== undefined) {
      Object.assign(queryBuilder.where, {
        is_visible: options.is_visible,
      });
    }

    return queryBuilder;
  }
}
