import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserDto,
  DeleteUserDto,
  FindAllUserDto,
  FindOneUserBypassOrganizationDto,
  FindOneUserDto,
  UpdateUserDto,
} from '../dtos/user.dto';
import { UserService } from '../../domain/services/user.service';

@Controller()
export class UserController {
  @Inject('ACCOUNT_USER_SERVICE')
  private readonly userService: UserService;

  @MessagePattern('MS_ACCOUNT_CREATE_USER')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ALL_USER')
  findAll(@Payload() findAllUserDto: FindAllUserDto) {
    return this.userService.findAll(findAllUserDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ALL_COUNT_USER')
  findAllCount(@Payload() findAllUserDto: FindAllUserDto) {
    return this.userService.findAllCount(findAllUserDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ONE_USER')
  findOne(@Payload() findOneUserDto: FindOneUserDto) {
    return this.userService.findOne(findOneUserDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ONE_BYPASS_ORGANIZATION_USER')
  findOneBypassOrganization(
    @Payload()
    findOneUserBypassOrganizationDto: FindOneUserBypassOrganizationDto,
  ) {
    return this.userService.findOneBypassOrganization(
      findOneUserBypassOrganizationDto,
    );
  }

  @MessagePattern('MS_ACCOUNT_UPDATE_USER')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  @MessagePattern('MS_ACCOUNT_REMOVE_USER')
  remove(@Payload() deleteUserDto: DeleteUserDto) {
    return this.userService.remove(deleteUserDto);
  }
}
