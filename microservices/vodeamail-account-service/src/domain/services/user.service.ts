import { Injectable } from '@nestjs/common';
import { Brackets, In, IsNull, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  buildFindAllQueryOption,
  buildFindOneQueryOption,
} from '../../@vodea/typeorm';
import {
  CreateUserDto,
  DeleteUserDto,
  FindAllUserDto,
  FindOneUserBypassOrganizationDto,
  FindOneUserDto,
  UpdateUserDto,
} from '../../application/dtos/user.dto';
import { RpcException } from '@nestjs/microservices';
import { FindAllRoleDto } from '../../application/dtos/role.dto';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(options: FindAllUserDto): Promise<User[]> {
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
            qb1
              .where('`name` LIKE ' + `"%${search}%"`)
              .orWhere('`email` LIKE ' + `"%${search}%"`);
          }),
        );
      });
    }

    return await this.userRepository.find(queryBuilder);
  }

  async findAllCount(options: FindAllRoleDto): Promise<number> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.userRepository
      .createQueryBuilder('users')
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
          qb.where('`users`.`name` LIKE ' + `"%${search}%"`).orWhere(
            '`users`.`email` LIKE ' + `"%${search}%"`,
          );
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(options: FindAllRoleDto): Promise<Role[]> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, order, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.userRepository
      .createQueryBuilder('users')
      .select('users.*')
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
          qb.where('`users`.`name` LIKE ' + `"%${search}%"`).orWhere(
            '`users`.`email` LIKE ' + `"%${search}%"`,
          );
        }),
      );
    }

    return builder.execute();
  }

  async findOne(options: FindOneUserDto): Promise<User> {
    const queryBuilder = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    return await this.userRepository.findOne(queryBuilder);
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

  protected buildFindQuery(
    queryBuilder,
    options: FindOneUserDto | FindAllUserDto,
  ) {
    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    if (options.role_id !== undefined) {
      Object.assign(queryBuilder.where, {
        role_id: options.role_id,
      });
    }

    return queryBuilder;
  }
}
