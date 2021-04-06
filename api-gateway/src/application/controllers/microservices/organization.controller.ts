import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException } from '../../../@vodea/microservices';
import { User } from '../../../@vodea/decorators/user.decorator';

@Controller('organization')
export class OrganizationController {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  @Get()
  async findOne(@User('organization_id') organizationId: string) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_ORGANIZATION', {
        id: organizationId,
      })
      .toPromise()
      .catch(clientProxyException);

    if (!data) {
      throw new NotFoundException(`Could not find resource ${organizationId}.`);
    }

    return { data };
  }

  @Put()
  async update(
    @User('organization_id') organizationId: string,
    @Body() updateOrganizationDto,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_UPDATE_ORGANIZATION', {
        ...updateOrganizationDto,
        id: organizationId,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
