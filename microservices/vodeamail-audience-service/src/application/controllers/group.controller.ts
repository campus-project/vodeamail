import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GroupService } from '../../domain/services/group.service';
import {
  CreateGroupDto,
  DeleteGroupDto,
  FindAllGroupDto,
  FindOneGroupDto,
  UpdateGroupDto,
} from '../dtos/group.dto';

@Controller()
export class GroupController {
  @Inject('AUDIENCE_GROUP_SERVICE')
  private readonly groupService: GroupService;

  @MessagePattern('MS_AUDIENCE_CREATE_GROUP')
  create(@Payload() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @MessagePattern('MS_AUDIENCE_FIND_ALL_GROUP')
  findAll(@Payload() findAllGroupDto: FindAllGroupDto) {
    return this.groupService.findAll(findAllGroupDto);
  }

  @MessagePattern('MS_AUDIENCE_FIND_ALL_COUNT_GROUP')
  findAllCount(@Payload() findAllGroupDto: FindAllGroupDto) {
    return this.groupService.findAllCount(findAllGroupDto);
  }

  @MessagePattern('MS_AUDIENCE_FIND_ONE_GROUP')
  findOne(@Payload() findOneGroupDto: FindOneGroupDto) {
    return this.groupService.findOne(findOneGroupDto);
  }

  @MessagePattern('MS_AUDIENCE_UPDATE_GROUP')
  update(@Payload() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(updateGroupDto);
  }

  @MessagePattern('MS_AUDIENCE_REMOVE_GROUP')
  remove(@Payload() deleteGroupDto: DeleteGroupDto) {
    return this.groupService.remove(deleteGroupDto);
  }
}
