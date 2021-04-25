import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { Repository } from 'typeorm';
import { RolePermissionView } from '../views/role-permission.view';

@Injectable()
export class PermissionService {
  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  @InjectRepository(RolePermissionView)
  private readonly rolePermissionViewRepository: Repository<RolePermissionView>;

  async allPermissionNames(): Promise<string[]> {
    const allPermissions = await this.permissionRepository.find();

    return allPermissions.map((permission) => permission.name);
  }

  async rolePermission(roleId: string): Promise<RolePermissionView[]> {
    return await this.rolePermissionViewRepository.find({
      where: {
        role_id: roleId,
      },
    });
  }
}
