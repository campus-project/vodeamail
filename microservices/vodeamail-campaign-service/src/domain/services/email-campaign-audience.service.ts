import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import {
  SetAcceptedEmailCampaignAudienceDto,
  SetClickedEmailCampaignAudienceDto,
  SetDeliveredEmailCampaignAudienceDto,
  SetFailedEmailCampaignAudienceDto,
  SetOpenedEmailCampaignAudienceDto,
  SetUnsubscribedEmailCampaignAudienceDto,
} from '../../application/dtos/email-campaign-audience.dto';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { OutstandingEmailCampaignAudienceView } from '../views/outstanding-email-campaign-audience.view';
import {
  EmailCampaignAnalytic,
  EmailCampaignAnalyticType,
} from '../entities/email-campaign-analytic.entity';

@Injectable()
export class EmailCampaignAudienceService {
  @Inject('REDIS_TRANSPORT')
  private readonly redisClient: ClientProxy;

  //entity
  @InjectRepository(EmailCampaignAudience)
  private readonly emailCampaignAudienceRepository: Repository<EmailCampaignAudience>;

  @InjectRepository(EmailCampaignAnalytic)
  private readonly emailCampaignAnalyticRepository: Repository<EmailCampaignAnalytic>;

  //view
  @InjectRepository(OutstandingEmailCampaignAudienceView)
  private readonly outstandingEmailCampaignAudienceViewRepository: Repository<OutstandingEmailCampaignAudienceView>;

  @Cron('*/3 * * * * *')
  async sendEmailToService() {
    const emailCampaignAudiences = await this.outstandingEmailCampaignAudienceViewRepository.find();

    for (const emailCampaignAudience of emailCampaignAudiences) {
      let content = emailCampaignAudience.html;

      content = this.injectLinkTracker(emailCampaignAudience.id, content);
      content = this.injectPixelTracker(emailCampaignAudience.id, content);

      await this.redisClient
        .send('MS_MAILER_CREATE_EMAIL_CAMPAIGN', {
          organization_id: emailCampaignAudience.organization_id,
          subject: emailCampaignAudience.subject,
          from: emailCampaignAudience.from,
          email_from: emailCampaignAudience.email_from,
          to: emailCampaignAudience.to,
          email_to: emailCampaignAudience.email_to,
          content: content,
          subject_id: emailCampaignAudience.id,
          callback_accepted_message:
            'MS_CAMPAIGN_SET_ACCEPTED_EMAIL_CAMPAIGN_AUDIENCE',
          callback_delivered_message:
            'MS_CAMPAIGN_SET_DELIVERED_EMAIL_CAMPAIGN_AUDIENCE',
          callback_failed_message:
            'MS_CAMPAIGN_SET_FAILED_EMAIL_CAMPAIGN_AUDIENCE',
        })
        .toPromise();
    }
  }

  injectLinkTracker(emailAudienceId: string, html: string): string {
    return html.replace(
      new RegExp(/(<a[^>]*href=["])([^"]*)/, 'gm'),
      function (m, $1, $2) {
        const newUrl = !$2
          ? '/'
          : `http://localhost:3010/a/c?ref=${encodeURIComponent(
              emailAudienceId,
            )}&r=${encodeURIComponent($2)}`;

        return $1 + newUrl;
      },
    );
  }

  injectPixelTracker(emailAudienceId: string, html: string) {
    const trackingPixel = `<img border=0 width=1 alt="" height=1 src="http://localhost:3010/a/o?ref=${emailAudienceId}" />`;
    return html.replace('\n', trackingPixel);
  }

  async findOne(id, relations: string[] = []): Promise<EmailCampaignAudience> {
    return await this.emailCampaignAudienceRepository.findOne({
      where: { id },
      relations,
    });
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

  async setOpened(
    setOpenedEmailCampaignAudienceDto: SetOpenedEmailCampaignAudienceDto,
  ) {
    const { id, timestamp } = setOpenedEmailCampaignAudienceDto;

    const emailCampaignAudience = await this.findOne(id);

    if (!emailCampaignAudience) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    if (!emailCampaignAudience.opened) {
      Object.assign(emailCampaignAudience, {
        opened: timestamp,
      });

      await this.emailCampaignAudienceRepository.save(emailCampaignAudience);
    }

    await this.emailCampaignAnalyticRepository.save(
      this.emailCampaignAnalyticRepository.create({
        email_campaign_id: emailCampaignAudience.email_campaign_id,
        email_campaign_audience_id: emailCampaignAudience.id,
        type: EmailCampaignAnalyticType.OPENED,
        timestamp,
      }),
    );

    return true;
  }

  async setClicked(
    setClickedEmailCampaignAudienceDto: SetClickedEmailCampaignAudienceDto,
  ) {
    const { id, timestamp } = setClickedEmailCampaignAudienceDto;

    const emailCampaignAudience = await this.findOne(id);

    if (!emailCampaignAudience) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    if (!emailCampaignAudience.clicked) {
      Object.assign(emailCampaignAudience, {
        clicked: timestamp,
      });

      await this.emailCampaignAudienceRepository.save(emailCampaignAudience);
    }

    await this.emailCampaignAnalyticRepository.save(
      this.emailCampaignAnalyticRepository.create({
        email_campaign_id: emailCampaignAudience.email_campaign_id,
        email_campaign_audience_id: emailCampaignAudience.id,
        type: EmailCampaignAnalyticType.CLICKED,
        timestamp,
      }),
    );

    return true;
  }

  async setUnsubscribed(
    setOpenedEmailCampaignAudienceDto: SetUnsubscribedEmailCampaignAudienceDto,
  ) {
    const { id, timestamp } = setOpenedEmailCampaignAudienceDto;

    const emailCampaignAudience = await this.findOne(id, ['email_campaign']);

    if (!emailCampaignAudience) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    if (!emailCampaignAudience.is_unsubscribe) {
      Object.assign(emailCampaignAudience, {
        is_unsubscribe: 1,
      });

      await this.emailCampaignAudienceRepository.save(emailCampaignAudience);

      await this.redisClient
        .emit('MS_AUDIENCE_UPDATE_SUBSCRIPTION_CONTACT', {
          id: emailCampaignAudience.contact_id,
          organization_id: emailCampaignAudience.email_campaign.organization_id,
          is_subscribed: false,
        })
        .toPromise();
    }

    await this.emailCampaignAnalyticRepository.save(
      this.emailCampaignAnalyticRepository.create({
        email_campaign_id: emailCampaignAudience.email_campaign_id,
        email_campaign_audience_id: emailCampaignAudience.id,
        type: EmailCampaignAnalyticType.UNSUBSCRIBED,
        timestamp,
      }),
    );

    await this.emailCampaignAudienceRepository.save(emailCampaignAudience);

    return true;
  }
}
