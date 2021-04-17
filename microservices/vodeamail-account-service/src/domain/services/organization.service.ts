import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder } from 'vnest-core';
import { RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';

import {
  CreateOrganizationDto,
  DeleteOrganizationDto,
  FindAllOrganizationDto,
  FindOneOrganizationDto,
  UpdateOrganizationDto,
} from '../../application/dtos/organization.dto';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(options: FindAllOrganizationDto): Promise<Organization[]> {
    const { relations } = options;
    const qb = this.organizationRepository
      .createQueryBuilder('organizations')
      .select('organizations.*');

    const builder = this.makeSearchable(
      buildFindAllQueryBuilder(qb, options),
      options,
    );

    let data = await builder.execute();

    //relations
    if (relations !== undefined && relations.length) {
      const organizationIds = data.map((organization) => organization.id);

      const relationValues = {
        roles: undefined,
        users: undefined,
      };

      //roles
      if (relations.indexOf('roles') !== -1) {
        relationValues.roles = await this.roleRepository.find({
          where: { organization_id: In([...new Set(organizationIds)]) },
        });
      }

      //users
      if (relations.indexOf('users') !== -1) {
        relationValues.users = await this.userRepository.find({
          where: { organization_id: In([...new Set(organizationIds)]) },
        });
      }

      data = data.map((organization) => {
        if (relationValues.roles !== undefined) {
          organization.roles = relationValues.roles.filter(
            (role) => role.organization_id === organization.id,
          );
        }

        if (relationValues.users !== undefined) {
          organization.users = relationValues.users.filter(
            (user) => user.organization_id === organization.id,
          );
        }

        return organization;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllOrganizationDto): Promise<number> {
    const qb = this.organizationRepository.createQueryBuilder('organizations');
    const builder = this.makeSearchable(
      buildFindAllQueryBuilder(qb, options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneOrganizationDto): Promise<Organization> {
    const data = await this.findAll(options);

    return _.head(data);
  }

  @Transactional()
  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const {
      id,
      name,
      address,
      telephone,
      fax,
      actor_id: created_by,
    } = createOrganizationDto;

    const organization = await this.organizationRepository.save(
      this.organizationRepository.create({
        id,
        name,
        address,
        telephone,
        fax,
        created_by,
        updated_by: created_by,
      }),
    );

    return this.findOne({ id: organization.id });
  }

  @Transactional()
  async update(
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const {
      id,
      name,
      address,
      telephone,
      fax,
      actor_id: updated_by,
    } = updateOrganizationDto;

    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new RpcException(`Count not find resource ${id}`);
    }

    Object.assign(organization, { name, address, telephone, fax, updated_by });

    await this.organizationRepository.save(organization);

    return this.findOne({ id: organization.id });
  }

  @Transactional()
  async remove(deleteOrganizationDto: DeleteOrganizationDto): Promise<number> {
    const { id, ids, is_hard, actor_id: deleted_by } = deleteOrganizationDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const organizations = await this.organizationRepository.find({
      where: {
        id: In(toBeDeleteIds),
      },
    });

    if (is_hard) {
      await this.organizationRepository.remove(organizations);
    } else {
      await this.organizationRepository.save(
        organizations.map((organization) => {
          Object.assign(organization, {
            deleted_by,
            deleted_at: new Date().toISOString(),
          });

          return organization;
        }),
      );
    }

    return organizations.length;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<Organization>,
    { search }: FindAllOrganizationDto,
  ) {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('organizations.name LIKE :search', params)
            .orWhere('organizations.address LIKE :search', params)
            .orWhere('organizations.telephone LIKE :search', params)
            .orWhere('organizations.fax LIKE :search', params);
        }),
      );
    }

    return builder;
  }
}
