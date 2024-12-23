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
  FindAllEmailCampaignQueryDto,
  FindOneEmailCampaignQueryDto,
} from '../../dtos/microservices/email-campaign.dto';
import { FindAllOrganizationQueryDto } from '../../dtos/microservices/organization.dto';

@Controller('email-campaign')
export class EmailCampaignController {
  @Inject('REDIS_TRANSPORT')
  private readonly redisClient: ClientProxy;

  @Get()
  async findAll(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllEmailCampaignQueryDto,
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
      status: query.status === undefined ? undefined : parseInt(query.status),
      group_id: query.group_id || undefined,
      group_ids: query.group_ids || undefined,
    });

    const data = await this.redisClient
      .send('MS_CAMPAIGN_FIND_ALL_EMAIL_CAMPAIGN', payload)
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
    @Query() query: FindOneEmailCampaignQueryDto,
  ) {
    const payload = buildFindOnePayload(query, {
      id,
      organization_id: organizationId,
      status: query.status === undefined ? undefined : parseInt(query.status),
      group_id: query.group_id || undefined,
      group_ids: query.group_ids || undefined,
    });

    const data = await this.redisClient
      .send('MS_CAMPAIGN_FIND_ONE_EMAIL_CAMPAIGN', payload)
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

  @Get('view/widget')
  async widget(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllOrganizationQueryDto,
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
    });

    const data = await this.redisClient
      .send('MS_CAMPAIGN_WIDGET_EMAIL_CAMPAIGN', payload)
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Get('view/chart')
  async chart(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllOrganizationQueryDto,
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
    });

    const data = await this.redisClient
      .send('MS_CAMPAIGN_CHART_EMAIL_CAMPAIGN', payload)
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
