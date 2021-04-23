import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'chart_dashboard_widgets',
  expression: `
    SELECT 
      email_campaigns.organization_id,
      date ( email_campaigns.sent_at ) AS date,
      SUM (IF( email_campaign_audiences.delivered IS NULL, 0, 1 )) total_delivered,
      SUM (IF( email_campaign_audiences.opened IS NULL, 0, 1 )) total_opened,
      SUM (IF( email_campaign_audiences.clicked IS NULL, 0, 1 )) total_clicked
    FROM
      email_campaigns
      JOIN email_campaign_audiences ON email_campaign_audiences.email_campaign_id = email_campaigns.id
    WHERE
      email_campaigns.deleted_at IS NULL
    GROUP BY
      email_campaigns.organization_id,
      date`,
})
export class ChartDashboardWidgetView {
  @ViewColumn()
  organization_id: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  total_delivered: number;

  @ViewColumn()
  total_opened: number;

  @ViewColumn()
  total_clicked: number;
}
