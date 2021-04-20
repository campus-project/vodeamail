import {
  Column,
  PrimaryGeneratedColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

@ViewEntity({
  name: 'outstanding_email_campaign_audiences',
  expression: `
    SELECT
      email_campaign_audiences.id,
      email_campaigns.organization_id,
      email_campaign_audiences.email_campaign_id,
      email_campaigns.subject,
      email_campaigns.from,
      email_campaigns.email_from,
      email_campaign_audiences.to,
      email_campaign_audiences.email_to,
      email_campaign_audiences.html
    FROM
      email_campaign_audiences
      JOIN email_campaigns ON email_campaigns.id = email_campaign_audiences.email_campaign_id 
    WHERE
      email_campaign_audiences.accepted IS NULL
      AND email_campaign_audiences.failed IS NULL
      AND email_campaigns.sent_at <= NOW() 
    UNION(
      SELECT
        email_campaign_audiences.id,
        email_campaigns.organization_id,
        email_campaign_audiences.email_campaign_id,
        email_campaigns.subject,
        email_campaigns.from,
        email_campaigns.email_from,
        email_campaign_audiences.to,
        email_campaign_audiences.email_to,
        email_campaign_audiences.html
      FROM
          email_campaign_audiences
          JOIN email_campaigns ON email_campaigns.id = email_campaign_audiences.email_campaign_id 
      WHERE
          email_campaign_audiences.accepted IS NOT NULL 
          AND email_campaign_audiences.failed IS NULL
          AND email_campaign_audiences.delivered IS NULL 
          AND TIME_TO_SEC(TIMEDIFF( NOW(), email_campaign_audiences.accepted )) >= 300 )`,
})
export class OutstandingEmailCampaignAudienceView {
  @ViewColumn()
  id: string;

  @ViewColumn()
  organization_id: string;

  @ViewColumn()
  email_campaign_id: string;

  @ViewColumn()
  subject: string;

  @ViewColumn()
  from?: string;

  @ViewColumn()
  email_from: string;

  @ViewColumn()
  to?: string;

  @ViewColumn()
  email_to: string;

  @ViewColumn()
  html: string;
}
