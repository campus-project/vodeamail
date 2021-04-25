import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'dashboard_widgets',
  expression: `
    SELECT 
      email_campaigns.organization_id,
      SUM(summary_email_campaigns.total_delivered) as total_delivered,
      SUM(summary_email_campaigns.total_opened) as total_opened,
      SUM(summary_email_campaigns.total_clicked) as total_clicked,
      SUM(IF(summary_email_campaigns.status = 1, 0, 1)) as total_active
    FROM email_campaigns
      JOIN summary_email_campaigns ON summary_email_campaigns.email_campaign_id = email_campaigns.id
    WHERE 
      email_campaigns.deleted_at IS NULL
    GROUP BY 
      organization_id`,
})
export class DashboardWidgetView {
  @ViewColumn()
  organization_id: string;

  @ViewColumn()
  total_delivered: number;

  @ViewColumn()
  total_opened: number;

  @ViewColumn()
  total_clicked: number;

  @ViewColumn()
  total_active: number;
}
