export class BaseEmailCampaignAudienceDto {
  ref: string;
}

export class setOpenedEmailCampaignAudience extends BaseEmailCampaignAudienceDto {
  r: string;
}

export class setClickedEmailCampaignAudience extends BaseEmailCampaignAudienceDto {}

export class setUnsubscribedEmailCampaignAudience extends BaseEmailCampaignAudienceDto {}
