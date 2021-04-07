import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';

@Entity('email_campaign_groups')
export class EmailCampaignGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', length: 36 })
  email_campaign_id: string;

  @Column({ type: 'uuid', length: 36 })
  group_id: string;

  @ManyToOne(() => EmailCampaign, (object) => object.email_campaign_groups)
  email_campaign: EmailCampaign;
}
