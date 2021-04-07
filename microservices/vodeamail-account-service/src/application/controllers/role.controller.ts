import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateRoleDto,
  DeleteRoleDto,
  FindAllRoleDto,
  FindOneRoleDto,
  UpdateRoleDto,
} from '../dtos/role.dto';
import { RoleService } from '../../domain/services/role.service';

@Controller()
export class RoleController {
  constructor(
    @Inject('ACCOUNT_ROLE_SERVICE')
    private readonly roleService: RoleService,
  ) {}

  @MessagePattern('MS_ACCOUNT_CREATE_ROLE')
  create(@Payload() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ALL_ROLE')
  findAll(@Payload() findAllRoleDto: FindAllRoleDto) {
    return this.roleService.findAll(findAllRoleDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ALL_COUNT_ROLE')
  findAllCount(@Payload() findAllRoleDto: FindAllRoleDto) {
    return this.roleService.findAllCount(findAllRoleDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ALL_BUILDER_ROLE')
  findAllBuilder(@Payload() findAllRoleDto: FindAllRoleDto) {
    return this.roleService.findAllBuilder(findAllRoleDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ONE_ROLE')
  findOne(@Payload() findOneRoleDto: FindOneRoleDto) {
    return this.roleService.findOne(findOneRoleDto);
  }

  @MessagePattern('MS_ACCOUNT_UPDATE_ROLE')
  update(@Payload() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  @MessagePattern('MS_ACCOUNT_REMOVE_ROLE')
  remove(@Payload() deleteRoleDto: DeleteRoleDto) {
    return this.roleService.remove(deleteRoleDto);
  }
}
