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
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildFindAllPayload,
  buildFindOnePayload,
  clientProxyException,
  paginationTransformer,
  User,
} from 'vnest-core';
import {
  FindAllOrganizationQueryDto,
  FindOneOrganizationQueryDto,
} from '../../dtos/microservices/organization.dto';

@Controller('organization')
export class OrganizationController {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllOrganizationQueryDto,
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
    });

    const data = await this.redisClient
      .send(
        payload.using === 'builder'
          ? 'MS_ACCOUNT_FIND_ALL_BUILDER_ORGANIZATION'
          : 'MS_ACCOUNT_FIND_ALL_ORGANIZATION',
        payload,
      )
      .toPromise()
      .catch(clientProxyException);

    if (query.per_page === undefined) {
      return { data };
    }

    const total = await this.redisClient
      .send('MS_ACCOUNT_FIND_ALL_COUNT_ORGANIZATION', payload)
      .toPromise()
      .catch(clientProxyException);

    return paginationTransformer(data, total);
  }

  @Get(':id')
  async findOne(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Query() query: FindOneOrganizationQueryDto,
  ) {
    const payload = buildFindOnePayload(query, {
      id,
      organization_id: organizationId,
    });

    const data = await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_ORGANIZATION', payload)
      .toPromise()
      .catch(clientProxyException);

    if (!data) {
      throw new NotFoundException(`Could not find resource ${id}.`);
    }

    return { data };
  }

  @Post()
  async create(
    @User('id') userId: string,
    @User('organization_id') organizationId: string,
    @Body() createOrganizationDto,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_CREATE_ORGANIZATION', {
        ...createOrganizationDto,
        actor_id: userId,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Put(':id')
  async update(
    @User('id') userId: string,
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Body() updateOrganizationDto,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_UPDATE_ORGANIZATION', {
        ...updateOrganizationDto,
        actor_id: userId,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Delete(':id')
  async remove(
    @User('id') userId: string,
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_REMOVE_ORGANIZATION', {
        actor_id: userId,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
