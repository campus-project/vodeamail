import { Group } from "./Group";
import { EmailTemplate } from "./EmailTemplate";
import { SummaryEmailCampaignAnalytic } from "./SummaryEmailCampaignAnalytic";

export interface EmailCampaign {
  id?: string;
  name: string;
  subject: string;
  from: string;
  email_from: string;
  email_template_id: string;
  email_template_html: string;
  sent_at: string;
  send_date_at: string | Date;
  send_time_at: string | Date;
  is_directly_scheduled: number;

  //append
  status?: number;
  total_audience?: number;
  total_delivered?: number;
  total_clicked?: number;
  total_opened?: number;
  total_unsubscribe?: number;
  last_opened?: string;
  last_clicked?: string;
  avg_open_duration?: number;

  email_template?: EmailTemplate;
  groups?: Group[];
  group_ids: Group[];
  summary_email_campaign_analytics?: SummaryEmailCampaignAnalytic[];
}
