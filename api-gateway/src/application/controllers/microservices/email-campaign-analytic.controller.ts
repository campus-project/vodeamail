import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'vnest-core';
import { setOpenedEmailCampaignAudience } from '../../dtos/microservices/email-campaign-audience.dto';
import * as moment from 'moment';

@Controller('a')
export class EmailCampaignAnalyticController {
  @Inject('REDIS_TRANSPORT')
  private readonly redisClient: ClientProxy;

  @Public()
  @Redirect('https://www.vodea.cloud', 302)
  @Get('c')
  async clicked(@Query() query: setOpenedEmailCampaignAudience) {
    const payload = { id: query.ref, timestamp: moment().format() };

    await this.redisClient
      .emit('MS_CAMPAIGN_SET_CLICKED_EMAIL_CAMPAIGN_AUDIENCE', payload)
      .toPromise();

    return { url: query.r };
  }

  @Public()
  @Get('o')
  async opened(@Query() query: setOpenedEmailCampaignAudience) {
    const payload = { id: query.ref, timestamp: moment().format() };

    await this.redisClient
      .emit('MS_CAMPAIGN_SET_OPENED_EMAIL_CAMPAIGN_AUDIENCE', payload)
      .toPromise();

    return { data: true };
  }

  @Public()
  @Post('u')
  async unsubscribed(@Body() body: setOpenedEmailCampaignAudience) {
    const payload = { id: body.ref, timestamp: moment().format() };

    await this.redisClient
      .emit('MS_CAMPAIGN_SET_UNSUBSCRIBED_EMAIL_CAMPAIGN_AUDIENCE', payload)
      .toPromise();

    return { data: true };
  }
}
