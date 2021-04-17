import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder, buildFindOneQueryOption } from 'vnest-core';
import { RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';

import {
  CreateUserDto,
  DeleteUserDto,
  FindAllUserDto,
  FindOneUserBypassOrganizationDto,
  FindOneUserDto,
  UpdateUserDto,
} from '../../application/dtos/user.dto';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async findAll(options: FindAllUserDto): Promise<User[]> {
    const { relations } = options;
    const qb = this.userRepository
      .createQueryBuilder('users')
      .select('users.*');

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
        roles: undefined,
        organizations: undefined,
      };

      data.forEach((user) => {
        roleIds.push(user.role_id);
        organizationIds.push(user.organization_id);
      });

      //organization
      if (relations.indexOf('organization') !== -1) {
        relationValues.organizations = await this.organizationRepository.find({
          id: In([...new Set(organizationIds)]),
        });
      }

      //role
      if (relations.indexOf('role') !== -1) {
        relationValues.roles = await this.roleRepository.find({
          id: In([...new Set(roleIds)]),
        });
      }

      data = data.map((user) => {
        if (relationValues.organizations !== undefined) {
          user.organization = relationValues.organizations.find(
            (organization) => organization.id === user.organization_id,
          );
        }

        if (relationValues.roles !== undefined) {
          user.role = relationValues.roles.find(
            (role) => role.id === user.role_id,
          );
        }

        return user;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllUserDto): Promise<number> {
    const qb = this.userRepository.createQueryBuilder('users');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneUserDto): Promise<User> {
    const data = await this.findAll(options);

    return _.head(data);
  }

  async findOneBypassOrganization(
    options: FindOneUserBypassOrganizationDto,
  ): Promise<User> {
    const queryBuilder = buildFindOneQueryOption({ options });

    if (options.role_id !== undefined) {
      Object.assign(queryBuilder.where, {
        role_id: options.role_id,
      });
    }

    return await this.userRepository.findOne(queryBuilder);
  }

  @Transactional()
  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      id,
      name,
      email,
      organization_id,
      role_id,
      actor_id: created_by,
    } = createUserDto;

    const user = await this.userRepository.save(
      this.userRepository.create({
        id,
        name,
        email,
        organization_id,
        role_id,
        created_by,
        updated_by: created_by,
      }),
    );

    return this.findOne({
      id: user.id,
      organization_id,
    });
  }

  @Transactional()
  async update(updateUserDto: UpdateUserDto): Promise<User> {
    const {
      id,
      name,
      email,
      organization_id,
      role_id,
      actor_id: updated_by,
    } = updateUserDto;

    const user = await this.userRepository.findOne({
      where: { id, organization_id },
    });

    if (!user) {
      throw new RpcException(`Count not find resource ${id}`);
    }

    Object.assign(user, { name, email, organization_id, role_id, updated_by });

    await this.userRepository.save(user);

    return this.findOne({
      id: user.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(deleteUserDto: DeleteUserDto): Promise<number> {
    const {
      id,
      ids,
      is_hard,
      organization_id,
      actor_id: deleted_by,
    } = deleteUserDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const users = await this.userRepository.find({
      where: {
        id: In(toBeDeleteIds),
        organization_id,
      },
    });

    if (is_hard) {
      await this.userRepository.remove(users);
    } else {
      await this.userRepository.save(
        users.map((user) => {
          Object.assign(user, {
            deleted_by,
            deleted_at: new Date().toISOString(),
          });

          return user;
        }),
      );
    }

    return users.length;
  }

  protected makeFilter(
    builder: SelectQueryBuilder<User>,
    options: FindOneUserDto | FindAllUserDto,
  ) {
    const { organization_id: organizationId, role_id: roleId } = options;

    builder.andWhere(
      new Brackets((qb) => {
        qb.where('users.organization_id = :organizationId', {
          organizationId,
        }).orWhere('users.organization_id IS NULL');
      }),
    );

    if (roleId !== undefined) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('users.role_id = :roleId', { roleId });
        }),
      );
    }

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<User>,
    { search }: FindAllUserDto,
  ) {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('users.name LIKE :search', params).orWhere(
            'users.email LIKE :search',
            params,
          );
        }),
      );
    }

    return builder;
  }
}
