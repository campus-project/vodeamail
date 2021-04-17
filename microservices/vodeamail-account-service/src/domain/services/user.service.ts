import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  buildFindAllQueryBuilder,
  buildFindOneQueryBuilder,
  buildFindOneQueryOption,
} from 'vnest-core';
import {
  CreateUserDto,
  DeleteUserDto,
  FindAllUserDto,
  FindOneUserBypassOrganizationDto,
  FindOneUserDto,
  UpdateUserDto,
} from '../../application/dtos/user.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(options: FindAllUserDto): Promise<User[]> {
    const qb = this.userRepository.createQueryBuilder('users');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return builder.execute();
  }

  async findAllCount(options: FindAllUserDto): Promise<number> {
    const qb = this.userRepository.createQueryBuilder('users');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return builder.getCount();
  }

  async findOne(options: FindOneUserDto): Promise<User> {
    const qb = this.userRepository.createQueryBuilder('users');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindOneQueryBuilder(qb, options), options),
      options,
    );

    return builder.execute();
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

    const user = await this.findOne({ id, organization_id });
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

  protected makeFilter(builder: any, options: FindOneUserDto | FindAllUserDto) {
    const { organization_id: organizationId, role_id: roleId } = options;

    builder.where(
      new Brackets((qb) => {
        qb.where('users.organization_id = :organizationId', {
          organizationId,
        }).orWhere('users.organization_id IS NULL');
      }),
    );

    if (roleId !== undefined) {
      builder.where(
        new Brackets((qb) => {
          qb.where('users.role_id = :roleId', { roleId });
        }),
      );
    }

    return builder;
  }

  protected makeSearchable(builder: any, { search }: FindAllUserDto) {
    if (search) {
      const params = { search: `%${search}%` };
      builder.where(
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
