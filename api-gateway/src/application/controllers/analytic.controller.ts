import { Controller, Get, Inject, Post, Query, Redirect } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException, Public } from 'vnest-core';
import { setOpenedEmailCampaignAudience } from '../dtos/microservices/email-campaign-audience.dto';
import * as moment from 'moment';

@Controller('a')
export class EmailCampaignController {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  @Public()
  @Redirect('https://www.vodea.cloud', 302)
  @Get('clicked')
  async clicked(@Query() query: setOpenedEmailCampaignAudience) {
    const payload = { id: query.ref, timestamp: moment().format() };

    const data = await this.redisClient
      .emit('MS_CAMPAIGN_SET_CLICKED_EMAIL_CAMPAIGN_AUDIENCE', payload)
      .toPromise();

    return { url: query.r };
  }

  @Public()
  @Post('opened')
  async opened(@Query() query: setOpenedEmailCampaignAudience) {
    const payload = { id: query.ref, timestamp: moment().format() };

    const data = await this.redisClient
      .send('MS_CAMPAIGN_SET_OPENED_EMAIL_CAMPAIGN_AUDIENCE', payload)
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Public()
  @Post('unsubscribed')
  async unsubscribed(@Query() query: setOpenedEmailCampaignAudience) {
    const payload = { id: query.ref, timestamp: moment().format() };

    const data = await this.redisClient
      .send('MS_CAMPAIGN_SET_UNSUBSCRIBED_EMAIL_CAMPAIGN_AUDIENCE', payload)
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
