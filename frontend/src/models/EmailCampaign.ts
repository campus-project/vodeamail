import { Group } from "./Group";

export interface EmailCampaign {
  id?: string;
  name: string;
  subject: string;
  from: string;
  email_from: string;
  email_template_id: string;
  sent_at: string;
  is_directly_scheduled: number;
  is_delivered: number;
  groups?: Group[];
  group_ids: Group[];
}
