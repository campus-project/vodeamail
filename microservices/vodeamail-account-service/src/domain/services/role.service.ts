import { Injectable } from '@nestjs/common';
import { Brackets, In, IsNull, Not, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  buildFindAllQueryOption,
  buildFindOneQueryOption,
} from '../../@vodea/typeorm';
import {
  CreateRoleDto,
  DeleteRoleDto,
  FindAllRoleDto,
  FindOneRoleDto,
  UpdateRoleDto,
} from '../../application/dtos/role.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(options: FindAllRoleDto): Promise<Role[]> {
    const queryBuilder = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    return await this.roleRepository.find(queryBuilder);
  }

  async findAllCount(options: FindAllRoleDto): Promise<number> {
    const { search } = options;
    const { where, cache, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.roleRepository
      .createQueryBuilder('roles')
      .leftJoin(
        'summary_roles',
        'summary_roles',
        '(summary_roles.role_id = roles.id)',
      )
      .where(where)
      .cache(cache)
      .take(take)
      .skip(skip);

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where(`roles.name LIKE "%${search}%"`).orWhere(
            `summary_roles.total_user LIKE "%${search}%"`,
          );
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(options: FindAllRoleDto): Promise<Role[]> {
    const { search } = options;
    const { where, cache, order, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.roleRepository
      .createQueryBuilder('roles')
      .select('roles.*')
      .addSelect('total_user')
      .leftJoin(
        'summary_roles',
        'summary_roles',
        '(summary_roles.role_id = roles.id)',
      )
      .where(where)
      .cache(cache)
      .orderBy(order)
      .take(take)
      .skip(skip);

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where(`roles.name LIKE "%${search}%"`).orWhere(
            `summary_roles.total_user LIKE "%${search}%"`,
          );
        }),
      );
    }

    return builder.execute();
  }

  async findOne(options: FindOneRoleDto): Promise<Role> {
    const queryBuilder = buildFindOneQueryOption({ options });

    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    if (options.is_special !== undefined) {
      Object.assign(queryBuilder.where, {
        is_special: options.is_special,
      });
    }

    if (options.is_default !== undefined) {
      Object.assign(queryBuilder.where, {
        is_default: options.is_default,
      });
    }

    return await this.roleRepository.findOne(queryBuilder);
  }

  @Transactional()
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const {
      id,
      name,
      organization_id,
      is_special,
      is_default,
      actor_id: created_by,
    } = createRoleDto;

    const role = await this.roleRepository.save(
      this.roleRepository.create({
        id,
        organization_id,
        name,
        is_special,
        is_default,
        created_by,
        updated_by: created_by,
      }),
    );

    if (role.is_default) {
      await this.syncOnlyAllowedSingleDefault(role.id);
    }

    return this.findOne({
      id: role.id,
      organization_id,
    });
  }

  @Transactional()
  async update(updateRoleDto: UpdateRoleDto): Promise<Role> {
    const {
      id,
      name,
      organization_id,
      is_special,
      is_default,
      actor_id: updated_by,
    } = updateRoleDto;

    const role = await this.findOne({ id, organization_id });
    if (!role) {
      throw new RpcException(`Count not find resource ${id}`);
    }

    Object.assign(role, { name, organization_id, is_default, updated_by });

    if (role.is_special !== is_special) {
      Object.assign(role, { is_special });
    }

    await this.roleRepository.save(role);

    if (role.is_default) {
      await this.syncOnlyAllowedSingleDefault(role.id, updated_by);
    }

    return this.findOne({
      id: role.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(deleteRoleDto: DeleteRoleDto): Promise<number> {
    const {
      id,
      ids,
      is_hard,
      organization_id,
      actor_id: deleted_by,
    } = deleteRoleDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const roles = await this.roleRepository.find({
      where: {
        id: In(toBeDeleteIds),
        organization_id,

        //is special cannot be delete
        is_special: false,
      },
    });

    if (is_hard) {
      await this.roleRepository.remove(roles);
    } else {
      await this.roleRepository.save(
        roles.map((role) => {
          Object.assign(role, {
            deleted_by,
            deleted_at: new Date().toISOString(),
          });

          return role;
        }),
      );
    }

    return roles.length;
  }

  @Transactional()
  protected async syncOnlyAllowedSingleDefault(id: string, actorId?: string) {
    const roles = await this.roleRepository.find({
      where: {
        id: Not(id),
        is_default: true,
      },
    });

    for (const role of roles) {
      Object.assign(role, {
        is_default: false,
        updated_by: actorId,
      });

      await this.roleRepository.save(role);
    }
  }

  protected buildFindQuery(
    queryBuilder,
    options: FindOneRoleDto | FindAllRoleDto,
  ) {
    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    if (options.is_special !== undefined) {
      Object.assign(queryBuilder.where, {
        is_special: options.is_special,
      });
    }

    if (options.is_default !== undefined) {
      Object.assign(queryBuilder.where, {
        is_default: options.is_default,
      });
    }

    return queryBuilder;
  }
}
