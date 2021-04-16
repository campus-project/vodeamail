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
  FindAllGroupQueryDto,
  FindOneGroupQueryDto,
} from '../../dtos/microservices/group.dto';

@Controller('group')
export class GroupController {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllGroupQueryDto,
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
    });

    const data = await this.redisClient
      .send(
        payload.using === 'builder'
          ? 'MS_AUDIENCE_FIND_ALL_BUILDER_GROUP'
          : 'MS_AUDIENCE_FIND_ALL_GROUP',
        payload,
      )
      .toPromise()
      .catch(clientProxyException);

    if (query.per_page === undefined) {
      return { data };
    }

    const total = await this.redisClient
      .send('MS_AUDIENCE_FIND_ALL_COUNT_GROUP', payload)
      .toPromise()
      .catch(clientProxyException);

    return paginationTransformer(data, total);
  }

  @Get(':id')
  async findOne(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Query() query: FindOneGroupQueryDto,
  ) {
    const payload = buildFindOnePayload(query, {
      id,
      organization_id: organizationId,
    });

    const data = await this.redisClient
      .send('MS_AUDIENCE_FIND_ONE_GROUP', payload)
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
    @Body() createGroupDto,
  ) {
    const data = await this.redisClient
      .send('MS_AUDIENCE_CREATE_GROUP', {
        ...createGroupDto,
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
    @Body() updateGroupDto,
  ) {
    const data = await this.redisClient
      .send('MS_AUDIENCE_UPDATE_GROUP', {
        ...updateGroupDto,
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
      .send('MS_AUDIENCE_REMOVE_GROUP', {
        actor_id: userId,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
