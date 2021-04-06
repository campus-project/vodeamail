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
import { EmailCampaignGroup } from './email-campaign-group.entity';
import { EmailTemplate } from './email-template.entity';

@Entity('email_campaigns')
export class EmailCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar' })
  from: string;

  @Column({ type: 'varchar' })
  email_from: string;

  @Column({ type: 'datetime' })
  sent_at: string;

  @Column({ type: 'tinyint', default: 0 })
  is_directly_scheduled: boolean;

  @Column({ type: 'uuid', length: 36 })
  email_template_id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @DeleteDateColumn()
  deleted_at?: string;

  @OneToMany(() => EmailCampaignGroup, (object) => object.email_campaign)
  email_campaign_groups: EmailCampaignGroup[];

  @ManyToOne(() => EmailTemplate, (object) => object.email_campaigns)
  email_template: EmailTemplate[];
}
