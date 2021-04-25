import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailCampaignAudienceService } from '../../domain/services/email-campaign-audience.service';
import {
  SetAcceptedEmailCampaignAudienceDto,
  SetClickedEmailCampaignAudienceDto,
  SetDeliveredEmailCampaignAudienceDto,
  SetFailedEmailCampaignAudienceDto,
  SetOpenedEmailCampaignAudienceDto,
  SetUnsubscribedEmailCampaignAudienceDto,
} from '../dtos/email-campaign-audience.dto';

@Controller()
export class EmailCampaignAudienceController {
  @Inject('CAMPAIGN_EMAIL_CAMPAIGN_AUDIENCE_SERVICE')
  private readonly emailCampaignAudienceService: EmailCampaignAudienceService;

  @MessagePattern('MS_CAMPAIGN_SET_ACCEPTED_EMAIL_CAMPAIGN_AUDIENCE')
  setAccepted(
    @Payload()
    setAcceptedEmailCampaignAudienceDto: SetAcceptedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setAccepted(
      setAcceptedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('MS_CAMPAIGN_SET_DELIVERED_EMAIL_CAMPAIGN_AUDIENCE')
  setDelivered(
    @Payload()
    setDeliveredEmailCampaignAudienceDto: SetDeliveredEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setDelivered(
      setDeliveredEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('MS_CAMPAIGN_SET_FAILED_EMAIL_CAMPAIGN_AUDIENCE')
  setFailed(
    @Payload()
    setFailedEmailCampaignAudienceDto: SetFailedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setFailed(
      setFailedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('MS_CAMPAIGN_SET_OPENED_EMAIL_CAMPAIGN_AUDIENCE')
  setOpened(
    @Payload()
    setOpenedEmailCampaignAudienceDto: SetOpenedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setOpened(
      setOpenedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('MS_CAMPAIGN_SET_CLICKED_EMAIL_CAMPAIGN_AUDIENCE')
  setClicked(
    @Payload()
    setClickedEmailCampaignAudienceDto: SetClickedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setClicked(
      setClickedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('MS_CAMPAIGN_SET_UNSUBSCRIBED_EMAIL_CAMPAIGN_AUDIENCE')
  setUnsubscribed(
    @Payload()
    setUnsubscribedEmailCampaignAudienceDto: SetUnsubscribedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setUnsubscribed(
      setUnsubscribedEmailCampaignAudienceDto,
    );
  }
}
