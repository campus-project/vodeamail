import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';

@Entity('email_campaign_audiences')
export class EmailCampaignAudience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  email_campaign_id: string;

  @Column({ type: 'uuid' })
  contact_id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'text' })
  value_tags: string;

  @Column({ type: 'text' })
  html: string;

  @Column({ type: 'tinyint', default: 0 })
  is_unsubscribe: boolean;

  @Column({ type: 'timestamp', nullable: true })
  accepted: string;

  @Column({ type: 'timestamp', nullable: true })
  delivered: string;

  @Column({ type: 'timestamp', nullable: true })
  failed: string;

  @Column({ type: 'text', nullable: true })
  failed_message: string;

  @ManyToOne(() => EmailCampaign, (object) => object.email_campaign_audiences)
  email_campaign: EmailCampaign;
}
