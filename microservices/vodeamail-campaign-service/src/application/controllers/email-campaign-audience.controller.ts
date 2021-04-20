import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailCampaignAudienceService } from '../../domain/services/email-campaign-audience.service';
import {
  SetAcceptedEmailCampaignAudienceDto,
  SetDeliveredEmailCampaignAudienceDto,
  SetFailedEmailCampaignAudienceDto,
} from '../dtos/email-campaign-audience.dto';

@Controller()
export class EmailCampaignAudienceController {
  constructor(
    @Inject('CAMPAIGN_EMAIL_CAMPAIGN_AUDIENCE_SERVICE')
    private readonly emailCampaign: EmailCampaignAudienceService,
  ) {}

  @MessagePattern('MS_CAMPAIGN_SET_ACCEPTED_EMAIL_CAMPAIGN_AUDIENCE')
  setAccepted(
    @Payload()
    setAcceptedEmailCampaignAudienceDto: SetAcceptedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaign.setAccepted(setAcceptedEmailCampaignAudienceDto);
  }

  @MessagePattern('MS_CAMPAIGN_SET_DELIVERED_EMAIL_CAMPAIGN_AUDIENCE')
  setDelivered(
    @Payload()
    setDeliveredEmailCampaignAudienceDto: SetDeliveredEmailCampaignAudienceDto,
  ) {
    return this.emailCampaign.setDelivered(
      setDeliveredEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('MS_CAMPAIGN_SET_FAILED_EMAIL_CAMPAIGN_AUDIENCE')
  setFailed(
    @Payload()
    setFailedEmailCampaignAudienceDto: SetFailedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaign.setFailed(setFailedEmailCampaignAudienceDto);
  }
}
