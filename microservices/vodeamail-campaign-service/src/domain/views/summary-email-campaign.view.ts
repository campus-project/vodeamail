import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'summary_email_campaigns',
  expression: `
    SELECT
      email_campaigns.id email_campaign_id,
      CASE
        WHEN email_campaigns.is_directly_scheduled THEN 1
        WHEN email_campaigns.sent_at <= NOW() THEN 1
        ELSE 0
      END AS 'status',
      COALESCE ( email_campaign_groups.total_group, 0 ) total_group,
      COALESCE ( email_campaign_audiences.total_audience, 0 ) total_audience
    FROM
      email_campaigns
    LEFT JOIN ( 
      SELECT 
        email_campaign_groups.email_campaign_id, 
        COUNT( DISTINCT email_campaign_groups.group_id ) AS total_group 
      FROM
        email_campaign_groups
      GROUP BY 
        email_campaign_groups.email_campaign_id 
    ) email_campaign_groups ON email_campaign_groups.email_campaign_id = email_campaigns.id
    LEFT JOIN ( 
      SELECT 
        email_campaign_audiences.email_campaign_id, 
        COUNT( DISTINCT email_campaign_audiences.email ) AS total_audience 
      FROM
        email_campaign_audiences
      GROUP BY 
        email_campaign_audiences.email_campaign_id 
    ) email_campaign_audiences ON email_campaign_audiences.email_campaign_id = email_campaigns.id`,
})
export class SummaryEmailCampaignView {
  @ViewColumn()
  email_campaign_id: string;

  @ViewColumn()
  total_group: number;

  @ViewColumn()
  total_audience: number;
}
