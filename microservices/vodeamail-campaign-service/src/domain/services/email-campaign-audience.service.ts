import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import {
  SetAcceptedEmailCampaignAudienceDto,
  SetDeliveredEmailCampaignAudienceDto,
  SetFailedEmailCampaignAudienceDto,
} from '../../application/dtos/email-campaign-audience.dto';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { OutstandingEmailCampaignAudienceView } from '../views/outstanding-email-campaign-audience.view';

@Injectable()
export class EmailCampaignAudienceService {
  constructor(
    @InjectRepository(EmailCampaignAudience)
    private readonly emailCampaignAudienceRepository: Repository<EmailCampaignAudience>,
    @InjectRepository(OutstandingEmailCampaignAudienceView)
    private readonly outstandingEmailCampaignAudienceViewRepository: Repository<OutstandingEmailCampaignAudienceView>,
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  @Cron('*/15 * * * * *')
  async sendEmailToService() {
    const emailCampaignAudiences = await this.outstandingEmailCampaignAudienceViewRepository.find();

    for (const emailCampaignAudience of emailCampaignAudiences) {
      console.log(emailCampaignAudience);
      const response = await this.redisClient
        .send('MS_MAILER_CREATE_EMAIL_CAMPAIGN', {
          organization_id: emailCampaignAudience.organization_id,
          subject: emailCampaignAudience.subject,
          from: emailCampaignAudience.from,
          email_from: emailCampaignAudience.email_from,
          to: emailCampaignAudience.to,
          email_to: emailCampaignAudience.email_to,
          content: emailCampaignAudience.html,
        })
        .toPromise();

      console.log(response);
    }
  }

  async findOne(id) {
    return await this.emailCampaignAudienceRepository.findOne(id);
  }

  async setAccepted(
    setAcceptedEmailCampaignAudienceDto: SetAcceptedEmailCampaignAudienceDto,
  ): Promise<boolean> {
    const { id, timestamp } = setAcceptedEmailCampaignAudienceDto;

    const emailCampaignAudience = await this.findOne(id);

    if (!emailCampaignAudience) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    Object.assign(emailCampaignAudience, {
      accepted: timestamp,
    });

    await this.emailCampaignAudienceRepository.save(emailCampaignAudience);

    return true;
  }

  async setDelivered(
    setDeliveredEmailCampaignAudienceDto: SetDeliveredEmailCampaignAudienceDto,
  ): Promise<boolean> {
    const { id, timestamp } = setDeliveredEmailCampaignAudienceDto;

    const emailCampaignAudience = await this.findOne(id);

    if (!emailCampaignAudience) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    Object.assign(emailCampaignAudience, {
      delivered: timestamp,
    });

    await this.emailCampaignAudienceRepository.save(emailCampaignAudience);

    return true;
  }

  async setFailed(
    setFailedEmailCampaignAudienceDto: SetFailedEmailCampaignAudienceDto,
  ): Promise<boolean> {
    const { id, timestamp, failed_message } = setFailedEmailCampaignAudienceDto;

    const emailCampaignAudience = await this.findOne(id);

    if (!emailCampaignAudience) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    Object.assign(emailCampaignAudience, {
      failed: timestamp,
      failed_message,
    });

    await this.emailCampaignAudienceRepository.save(emailCampaignAudience);

    return true;
  }
}
