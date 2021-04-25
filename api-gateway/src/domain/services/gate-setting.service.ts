import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder } from 'vnest-core';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';

import {
  CreateGateSettingDto,
  DeleteGateSettingDto,
  FindAllGateSettingDto,
  FindOneGateSettingDto,
  UpdateGateSettingDto,
} from '../../application/dtos/gate-setting.dto';
import { GateSetting } from '../entities/gate-setting.entity';
import { GateSettingPermission } from '../entities/gate-setting-permission.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class GateSettingService {
  @Inject('REDIS_TRANSPORT')
  private readonly redisClient: ClientProxy;

  //entity
  @InjectRepository(GateSetting)
  private readonly gateSettingRepository: Repository<GateSetting>;

  @InjectRepository(GateSettingPermission)
  private readonly gateSettingPermissionRepository: Repository<GateSettingPermission>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  async findAll(options: FindAllGateSettingDto): Promise<GateSetting[]> {
    const { relations, organization_id } = options;
    const qb = this.gateSettingRepository
      .createQueryBuilder('gate_settings')
      .select('gate_settings.*');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    let data = await builder.execute();

    //relations
    if (relations !== undefined && relations.length) {
      const gateSettingIds = [];
      const roleIds = [];

      const relationValues = {
        roles: undefined,
        gateSettingPermissions: undefined,
        permissions: undefined,
      };

      data.forEach((gateSetting) => {
        gateSettingIds.push(gateSetting.id);
        roleIds.push(gateSetting.role_id);
      });

      //role
      if (relations.indexOf('role') !== -1) {
        relationValues.roles = await this.redisClient
          .send('MS_ACCOUNT_FIND_ALL_ROLE', {
            ids: roleIds,
            organization_id,
          })
          .toPromise();
      }

      //gate setting permissions
      if (relations.indexOf('gate_setting_permissions') !== -1) {
        relationValues.gateSettingPermissions = await this.gateSettingPermissionRepository.find(
          {
            where: {
              gate_setting_id: In([...new Set(gateSettingIds)]),
            },
            relations: ['permissions'],
          },
        );
      }

      //permissions
      if (relations.indexOf('permissions') !== -1) {
        relationValues.permissions = await this.gateSettingPermissionRepository.find(
          {
            where: {
              gate_setting_id: In([...new Set(gateSettingIds)]),
            },
            relations: ['permission'],
          },
        );
      }

      data = data.map((gateSetting) => {
        if (relationValues.roles !== undefined) {
          gateSetting.role = relationValues.roles.find(
            (role) => role.id === gateSetting.role_id,
          );
        }

        if (relationValues.gateSettingPermissions !== undefined) {
          gateSetting.gate_setting_permissions = relationValues.gateSettingPermissions.filter(
            (gateSettingPermission) =>
              gateSettingPermission.gate_setting_id === gateSetting.id,
          );
        }

        if (relationValues.permissions !== undefined) {
          const permissions = [];

          relationValues.permissions.forEach((gateSettingPermission) => {
            if (gateSettingPermission.gate_setting_id === gateSetting.id) {
              permissions.push(gateSettingPermission.permission);
            }
          });

          gateSetting.permissions = permissions;
        }

        return gateSetting;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllGateSettingDto): Promise<number> {
    const qb = this.gateSettingRepository.createQueryBuilder('gate_settings');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneGateSettingDto): Promise<GateSetting> {
    const data = await this.findAll(options);

    return _.head(data);
  }

  @Transactional()
  async create(
    createGateSettingDto: CreateGateSettingDto,
  ): Promise<GateSetting> {
    const {
      id,
      organization_id,
      name,
      valid_from,
      role_id,
      permission_ids,
      actor_id: created_by,
    } = createGateSettingDto;

    const gateSetting = await this.gateSettingRepository.save(
      this.gateSettingRepository.create({
        id,
        organization_id,
        name,
        valid_from,
        role_id,
        created_by,
        updated_by: created_by,
      }),
    );

    if (permission_ids.length) {
      const permissions = await this.permissionRepository.find({
        where: {
          id: In([...new Set(permission_ids)]),
        },
      });

      for (const permission of permissions) {
        await this.gateSettingPermissionRepository.save(
          this.gateSettingPermissionRepository.create({
            permission_id: permission.id,
            gate_setting: gateSetting,
          }),
        );
      }
    }

    return this.findOne({
      id: gateSetting.id,
      organization_id,
    });
  }

  @Transactional()
  async update(
    updateGateSettingDto: UpdateGateSettingDto,
  ): Promise<GateSetting> {
    const {
      id,
      organization_id,
      name,
      valid_from,
      role_id,
      permission_ids,
      actor_id: updated_by,
    } = updateGateSettingDto;

    const gateSetting = await this.gateSettingRepository.findOne({
      where: { id, organization_id },
    });

    if (!gateSetting) {
      throw new RpcException(`Count not find resource ${id}`);
    }

    await this.gateSettingPermissionRepository.delete({ gate_setting_id: id });

    Object.assign(gateSetting, {
      organization_id,
      name,
      valid_from,
      role_id,
      updated_by,
    });

    await this.gateSettingRepository.save(gateSetting);

    if (permission_ids.length) {
      const permissions = await this.permissionRepository.find({
        where: {
          id: In([...new Set(permission_ids)]),
        },
      });

      for (const permission of permissions) {
        await this.gateSettingPermissionRepository.save(
          this.gateSettingPermissionRepository.create({
            permission_id: permission.id,
            gate_setting: gateSetting,
          }),
        );
      }
    }

    return this.findOne({
      id: gateSetting.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(deleteGateSettingDto: DeleteGateSettingDto): Promise<number> {
    const {
      id,
      ids,
      is_hard,
      organization_id,
      actor_id: deleted_by,
    } = deleteGateSettingDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const gateSettings = await this.gateSettingRepository.find({
      where: {
        id: In(toBeDeleteIds),
        organization_id,
      },
    });

    if (is_hard) {
      await this.gateSettingRepository.remove(gateSettings);
    } else {
      await this.gateSettingRepository.save(
        gateSettings.map((gateSetting) => {
          Object.assign(gateSetting, {
            deleted_by,
            deleted_at: new Date().toISOString(),
          });

          return gateSetting;
        }),
      );
    }

    return gateSettings.length;
  }

  @Transactional()
  protected async syncOnlyAllowedSingleDefault(
    id: string,
    actorId?: string,
  ): Promise<void> {
    const gateSettings = await this.gateSettingRepository.find({
      where: {
        id: Not(id),
        is_default: true,
      },
    });

    for (const gateSetting of gateSettings) {
      Object.assign(gateSetting, {
        is_default: false,
        updated_by: actorId,
      });

      await this.gateSettingRepository.save(gateSetting);
    }
  }

  protected makeFilter(
    builder: SelectQueryBuilder<GateSetting>,
    options: FindOneGateSettingDto | FindAllGateSettingDto,
  ): SelectQueryBuilder<GateSetting> {
    const { organization_id: organizationId, role_id: roleId } = options;

    builder.andWhere(
      new Brackets((qb) => {
        qb.where('gate_settings.organization_id = :organizationId', {
          organizationId,
        }).orWhere('gate_settings.organization_id IS NULL');
      }),
    );

    if (roleId !== undefined) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('gate_settings.role_id = :roleId', { roleId });
        }),
      );
    }

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<GateSetting>,
    { search }: FindAllGateSettingDto,
  ): SelectQueryBuilder<GateSetting> {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('gate_settings.name LIKE :search', params);
        }),
      );
    }

    return builder;
  }
}
