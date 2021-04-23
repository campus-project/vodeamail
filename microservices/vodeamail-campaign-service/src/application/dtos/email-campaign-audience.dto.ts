import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BaseTimestampEmailCampaignAudienceDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsString()
  timestamp: string;
}

export class SetAcceptedEmailCampaignAudienceDto extends BaseTimestampEmailCampaignAudienceDto {}

export class SetDeliveredEmailCampaignAudienceDto extends BaseTimestampEmailCampaignAudienceDto {}

export class SetOpenedEmailCampaignAudienceDto extends BaseTimestampEmailCampaignAudienceDto {}

export class SetClickedEmailCampaignAudienceDto extends BaseTimestampEmailCampaignAudienceDto {}

export class SetUnsubscribedEmailCampaignAudienceDto extends BaseTimestampEmailCampaignAudienceDto {}

export class SetFailedEmailCampaignAudienceDto extends BaseTimestampEmailCampaignAudienceDto {
  @IsNotEmpty()
  @IsString()
  failed_message: string;
}
