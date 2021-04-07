import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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
    const queryBuilder = buildFindAllQueryOption({ options });
    return await this.organizationRepository.find(queryBuilder);
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
}
