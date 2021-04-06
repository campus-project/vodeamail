import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';

@Entity('email_campaign_groups')
export class EmailCampaignGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'uuid', length: 36 })
  email_campaign_id: string;

  @Column({ type: 'uuid', length: 36 })
  group_id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @DeleteDateColumn()
  deleted_at?: string;

  @ManyToOne(() => EmailCampaign, (object) => object.email_campaign_groups)
  email_campaign: EmailCampaign;
}
