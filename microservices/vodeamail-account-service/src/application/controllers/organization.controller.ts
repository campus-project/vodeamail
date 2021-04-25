import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateOrganizationDto,
  DeleteOrganizationDto,
  FindAllOrganizationDto,
  FindOneOrganizationDto,
  UpdateOrganizationDto,
} from '../dtos/organization.dto';
import { OrganizationService } from '../../domain/services/organization.service';

@Controller()
export class OrganizationController {
  @Inject('ACCOUNT_ORGANIZATION_SERVICE')
  private readonly organizationService: OrganizationService;

  @MessagePattern('MS_ACCOUNT_CREATE_ORGANIZATION')
  create(@Payload() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ALL_ORGANIZATION')
  findAll(@Payload() findAllOrganizationDto: FindAllOrganizationDto) {
    return this.organizationService.findAll(findAllOrganizationDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ALL_COUNT_ORGANIZATION')
  findAllCount(@Payload() findAllOrganizationDto: FindAllOrganizationDto) {
    return this.organizationService.findAllCount(findAllOrganizationDto);
  }

  @MessagePattern('MS_ACCOUNT_FIND_ONE_ORGANIZATION')
  findOne(@Payload() findOneOrganizationDto: FindOneOrganizationDto) {
    return this.organizationService.findOne(findOneOrganizationDto);
  }

  @MessagePattern('MS_ACCOUNT_UPDATE_ORGANIZATION')
  update(@Payload() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(updateOrganizationDto);
  }

  @MessagePattern('MS_ACCOUNT_REMOVE_ORGANIZATION')
  remove(@Payload() deleteOrganizationDto: DeleteOrganizationDto) {
    return this.organizationService.remove(deleteOrganizationDto);
  }
}
