import { Group } from "./Group";
import { EmailTemplate } from "./EmailTemplate";

export interface SummaryEmailCampaignAnalytic {
  email_campaign_id: string;
  date: string;
  opened: number;
  clicked: number;
}
