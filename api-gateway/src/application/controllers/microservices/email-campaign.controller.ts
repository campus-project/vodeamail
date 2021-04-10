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
import { clientProxyException } from '../../../@vodea/microservices';
import { User } from '../../../@vodea/decorators/user.decorator';
import { FindAllQueryDto } from '../../../@vodea/dtos/find-all-query.dto';
import {
  buildFindAllPayload,
  paginationTransformer,
} from '../../../@vodea/helpers';

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
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
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
  ) {
    const data = await this.redisClient
      .send('MS_CAMPAIGN_FIND_ONE_EMAIL_CAMPAIGN', {
        organization_id: organizationId,
        relations,
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
