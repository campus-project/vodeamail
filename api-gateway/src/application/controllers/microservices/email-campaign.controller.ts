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
  clientProxyException,
  FindAllQueryDto,
  paginationTransformer,
  User,
} from 'vnest-core';

@Controller('email-campaign')
export class EmailCampaignController {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllQueryDto,
    @Query('status') status: string | undefined,
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
      status: status === undefined ? undefined : parseInt(status),
    });

    const data = await this.redisClient
      .send(
        payload.using === 'builder'
          ? 'MS_CAMPAIGN_FIND_ALL_BUILDER_EMAIL_CAMPAIGN'
          : 'MS_CAMPAIGN_FIND_ALL_EMAIL_CAMPAIGN',
        payload,
      )
      .toPromise()
      .catch(clientProxyException);

    if (query.per_page === undefined) {
      return { data };
    }

    const total = await this.redisClient
      .send('MS_CAMPAIGN_FIND_ALL_COUNT_EMAIL_CAMPAIGN', payload)
      .toPromise()
      .catch(clientProxyException);

    return paginationTransformer(data, total);
  }

  @Get(':id')
  async findOne(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Query('relations') relations: string[],
    @Query('status') status: string | undefined,
  ) {
    const data = await this.redisClient
      .send('MS_CAMPAIGN_FIND_ONE_EMAIL_CAMPAIGN', {
        organization_id: organizationId,
        relations,
        status: status === undefined ? undefined : parseInt(status),
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
    @User('id') userId: string,
    @User('organization_id') organizationId: string,
    @Body() createContactDto,
  ) {
    const data = await this.redisClient
      .send('MS_CAMPAIGN_CREATE_EMAIL_CAMPAIGN', {
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
      .send('MS_CAMPAIGN_UPDATE_EMAIL_CAMPAIGN', {
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
      .send('MS_CAMPAIGN_REMOVE_EMAIL_CAMPAIGN', {
        actor_id: userId,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
