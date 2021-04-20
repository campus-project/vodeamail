import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'summary_email_campaign_analytics',
  expression: `
    SELECT
      email_campaign_analytics.email_campaign_id,
      date( email_campaign_analytics.timestamp ) AS date,
      SUM(IF (email_campaign_analytics.type = '0', 1, 0)) as opened,
      SUM(IF (email_campaign_analytics.type = '1', 1, 0)) as clicked
    FROM
      email_campaign_analytics
    GROUP BY
      date, email_campaign_id`,
})
export class SummaryEmailCampaignAnalyticView {
  @ViewColumn()
  email_campaign_id: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  opened: number;

  @ViewColumn()
  clicked: number;
}
