import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  buildFindAllQueryOption,
  buildFindOneQueryOption,
} from '../../@vodea/typeorm';
import {
  CreateOrganizationDto,
  DeleteOrganizationDto,
  FindAllOrganizationDto,
  FindOneOrganizationDto,
  UpdateOrganizationDto,
} from '../../application/dtos/organization.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async findAll(options: FindAllOrganizationDto): Promise<Organization[]> {
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
              .orWhere('`address` LIKE ' + `"%${search}%"`)
              .orWhere('`telephone` LIKE ' + `"%${search}%"`)
              .orWhere('`fax` LIKE ' + `"%${search}%"`);
          }),
        );
      });
    }

    return await this.organizationRepository.find(queryBuilder);
  }

  async findAllCount(options: FindAllOrganizationDto): Promise<number> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.organizationRepository
      .createQueryBuilder('organizations')
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
          qb.where('`organizations`.`name` LIKE ' + `"%${search}%"`)
            .orWhere('`organizations`.`address` LIKE ' + `"%${search}%"`)
            .orWhere('`organizations`.`telephone` LIKE ' + `"%${search}%"`)
            .orWhere('`organizations`.`fax` LIKE ' + `"%${search}%"`);
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(
    options: FindAllOrganizationDto,
  ): Promise<Organization[]> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, order, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.organizationRepository
      .createQueryBuilder('organizations')
      .select('organizations.*')
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
          qb.where('`organizations`.`name` LIKE ' + `"%${search}%"`)
            .orWhere('`organizations`.`address` LIKE ' + `"%${search}%"`)
            .orWhere('`organizations`.`telephone` LIKE ' + `"%${search}%"`)
            .orWhere('`organizations`.`fax` LIKE ' + `"%${search}%"`);
        }),
      );
    }

    return builder.execute();
  }

  async findOne(options: FindOneOrganizationDto): Promise<Organization> {
    const queryBuilder = buildFindOneQueryOption({ options });

    return await this.organizationRepository.findOne(queryBuilder);
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

    const organization = await this.findOne({ id });
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

  protected buildFindQuery(
    queryBuilder,
    options: FindOneOrganizationDto | FindAllOrganizationDto,
  ) {
    return queryBuilder;
  }
}
