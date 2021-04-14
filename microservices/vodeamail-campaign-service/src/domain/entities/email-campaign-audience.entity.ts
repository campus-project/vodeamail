import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';
import { EmailTemplate } from './email-template.entity';

@Entity('email_campaign_audiences')
export class EmailCampaignAudience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', length: 36 })
  email_campaign_id: string;

  @Column({ type: 'uuid', length: 36 })
  email_template_id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'text' })
  value_tags: string;

  @ManyToOne(() => EmailCampaign, (object) => object.email_campaign_audiences)
  email_campaign: EmailCampaign;

  @ManyToOne(() => EmailCampaign, (object) => object.email_campaign_audiences)
  email_template: EmailTemplate;
}
