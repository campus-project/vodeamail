import { Injectable } from '@nestjs/common';
import { In, IsNull, Repository } from 'typeorm';
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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(options: FindAllUserDto): Promise<User[]> {
    const queryBuilder = buildFindAllQueryOption({ options });

    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    if (options.role_id !== undefined) {
      Object.assign(queryBuilder.where, {
        role_id: options.role_id,
      });
    }

    return await this.userRepository.find(queryBuilder);
  }

  async findOne(options: FindOneUserDto): Promise<User> {
    const queryBuilder = buildFindOneQueryOption({ options });

    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    if (options.role_id !== undefined) {
      Object.assign(queryBuilder.where, {
        role_id: options.role_id,
      });
    }

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
    const { id, name, email, organization_id, role_id } = createUserDto;

    const user = await this.userRepository.save(
      this.userRepository.create({
        id,
        name,
        email,
        organization_id,
        role_id,
      }),
    );

    return this.findOne({
      id: user.id,
      organization_id,
    });
  }

  @Transactional()
  async update(updateUserDto: UpdateUserDto): Promise<User> {
    const { id, name, email, organization_id, role_id } = updateUserDto;

    const user = await this.findOne({ id, organization_id });
    if (!user) {
      throw new RpcException(`Count not find resource ${id}`);
    }

    Object.assign(user, { name, email, organization_id, role_id });

    await this.userRepository.save(user);

    return this.findOne({
      id: user.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(deleteUserDto: DeleteUserDto): Promise<number> {
    const { id, ids, is_hard, organization_id } = deleteUserDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const roles = await this.userRepository.find({
      where: {
        id: In(toBeDeleteIds),
        organization_id,
      },
    });

    if (is_hard) {
      await this.userRepository.remove(roles);
    } else {
      await this.userRepository.softRemove(roles);
    }

    return roles.length;
  }
}
