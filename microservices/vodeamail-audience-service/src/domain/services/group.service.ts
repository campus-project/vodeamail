import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Brackets, In, IsNull, Repository } from 'typeorm';
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
    const queryBuilder = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    return await this.groupRepository.find(queryBuilder);
  }

  async findAllCount(options: FindAllGroupDto): Promise<number> {
    const { search } = options;
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

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where(`groups.name LIKE "%${search}%"`).orWhere(
            `summary_groups.total_contact LIKE "%${search}%"`,
          );
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(options: FindAllGroupDto): Promise<Group[]> {
    const { search } = options;
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

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where(`groups.name LIKE "%${search}%"`).orWhere(
            `summary_groups.total_contact LIKE "%${search}%"`,
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
    });

    await this.groupRepository.save(group);

    return this.findOne({
      id: group.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(deleteGroupDto: DeleteGroupDto): Promise<number> {
    const { id, ids, is_hard, organization_id } = deleteGroupDto;

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
      await this.groupRepository.softRemove(groups);
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
