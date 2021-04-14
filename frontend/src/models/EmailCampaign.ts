import { Group } from "./Group";
import { EmailTemplate } from "./EmailTemplate";

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
  status: number;

  email_template?: EmailTemplate;
  groups?: Group[];
  group_ids: Group[];
}
