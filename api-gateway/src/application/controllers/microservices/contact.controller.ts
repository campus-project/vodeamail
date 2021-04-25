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
  FindAllContactQueryDto,
  FindOneContactQueryDto,
} from '../../dtos/microservices/contact.dto';

@Controller('contact')
export class ContactController {
  @Inject('REDIS_TRANSPORT')
  private readonly redisClient: ClientProxy;

  @Get()
  async findAll(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllContactQueryDto,
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
      group_id: query.group_id || undefined,
      group_ids: query.group_ids || undefined,
      is_subscribed:
        query.is_subscribed === undefined
          ? undefined
          : query.is_subscribed.toLowerCase() === 'true',
    });

    const data = await this.redisClient
      .send('MS_AUDIENCE_FIND_ALL_CONTACT', payload)
      .toPromise()
      .catch(clientProxyException);

    if (query.per_page === undefined) {
      return { data };
    }

    const total = await this.redisClient
      .send('MS_AUDIENCE_FIND_ALL_COUNT_CONTACT', payload)
      .toPromise()
      .catch(clientProxyException);

    return paginationTransformer(data, total);
  }

  @Get(':id')
  async findOne(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Query() query: FindOneContactQueryDto,
  ) {
    const payload = buildFindOnePayload(query, {
      id,
      organization_id: organizationId,
      group_id: query.group_id || undefined,
      group_ids: query.group_ids || undefined,
      is_subscribed:
        query.is_subscribed === undefined
          ? undefined
          : query.is_subscribed.toLowerCase() === 'true',
    });

    const data = await this.redisClient
      .send('MS_AUDIENCE_FIND_ONE_CONTACT', payload)
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
    @Body() createContactDto,
  ) {
    const data = await this.redisClient
      .send('MS_AUDIENCE_CREATE_CONTACT', {
        ...createContactDto,
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
    @Body() updateContactDto,
  ) {
    const data = await this.redisClient
      .send('MS_AUDIENCE_UPDATE_CONTACT', {
        ...updateContactDto,
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
      .send('MS_AUDIENCE_REMOVE_CONTACT', {
        actor_id: userId,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
