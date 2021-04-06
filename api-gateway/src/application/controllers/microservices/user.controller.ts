import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException } from '../../../@vodea/microservices';
import { User } from '../../../@vodea/decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  @Get()
  async findAll(@User('organization_id') organizationId: string) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_FIND_ALL_USER', {
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Get(':id')
  async findOne(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_USER', {
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    if (!data) {
      throw new NotFoundException(`Could not find resource ${id}.`);
    }

    return { data };
  }

  @Post()
  async create(
    @User('organization_id') organizationId: string,
    @Body() createUserDto,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_CREATE_USER', {
        ...createUserDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Put(':id')
  async update(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Body() updateUserDto,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_UPDATE_USER', {
        ...updateUserDto,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Delete(':id')
  async remove(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_REMOVE_USER', {
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
