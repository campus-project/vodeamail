import { Injectable } from '@nestjs/common';
import { Brackets, In, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder } from 'vnest-core';
import { RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';

import {
  CreateRoleDto,
  DeleteRoleDto,
  FindAllRoleDto,
  FindOneRoleDto,
  UpdateRoleDto,
} from '../../application/dtos/role.dto';
import { Role } from '../entities/role.entity';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(options: FindAllRoleDto): Promise<Role[]> {
    const { relations } = options;
    const qb = this.roleRepository
      .createQueryBuilder('roles')
      .select('roles.*')
      .addSelect('summary_roles.total_user', 'total_user')
      .leftJoin(
        'summary_roles',
        'summary_roles',
        '(summary_roles.role_id = roles.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    let data = await builder.execute();

    //relations
    if (relations !== undefined && relations.length) {
      const roleIds = [];
      const organizationIds = [];

      const relationValues = {
        organizations: undefined,
        users: undefined,
      };

      data.forEach((role) => {
        roleIds.push(role.id);
        organizationIds.push(role.organization_id);
      });

      //organization
      if (relations.indexOf('organization') !== -1) {
        relationValues.organizations = await this.organizationRepository.find({
          id: In([...new Set(organizationIds)]),
        });
      }

      //users
      if (relations.indexOf('users') !== -1) {
        relationValues.users = await this.userRepository.find({
          role_id: In([...new Set(roleIds)]),
        });
      }

      data = data.map((role) => {
        if (relationValues.organizations !== undefined) {
          role.organization =
            relationValues.organizations.find(
              (organization) => organization.id === role.organization_id,
            ) || null;
        }

        if (relationValues.users !== undefined) {
          role.users =
            relationValues.users.filter((user) => user.role_id === role.id) ||
            [];
        }

        return role;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllRoleDto): Promise<number> {
    const qb = this.roleRepository
      .createQueryBuilder('roles')
      .leftJoin(
        'summary_roles',
        'summary_roles',
        '(summary_roles.role_id = roles.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneRoleDto): Promise<Role> {
    const data = await this.findAll(options);

    return _.head(data);
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

    const role = await this.roleRepository.findOne({
      where: { id, organization_id },
    });

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

  protected makeFilter(
    builder: SelectQueryBuilder<Role>,
    options: FindOneRoleDto | FindAllRoleDto,
  ) {
    const {
      organization_id: organizationId,
      is_special: isSpecial,
      is_default: isDefault,
    } = options;

    builder.andWhere(
      new Brackets((qb) => {
        qb.where('roles.organization_id = :organizationId', {
          organizationId,
        }).orWhere('roles.organization_id IS NULL');
      }),
    );

    if (isSpecial !== undefined) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('roles.is_special = :isSpecial', { isSpecial });
        }),
      );
    }

    if (isDefault !== undefined) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('roles.is_default = :isDefault', { isDefault });
        }),
      );
    }

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<Role>,
    { search }: FindAllRoleDto,
  ) {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('roles.name LIKE :search', params).orWhere(
            'summary_roles.total_user LIKE :search',
            params,
          );
        }),
      );
    }

    return builder;
  }
}
