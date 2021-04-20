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
import { EmailCampaignAudience } from './email-campaign-audience.entity';
import { EmailCampaignAnalytic } from './email-campaign-analytic.entity';

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

  @Column({ type: 'uuid' })
  email_template_id: string;

  @Column({ type: 'text' })
  email_template_html: string;

  @Column({ type: 'timestamp' })
  sent_at: string;

  @Column({ type: 'tinyint', default: 0 })
  is_directly_scheduled: boolean;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @DeleteDateColumn()
  deleted_at?: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by?: string;

  @Column({ type: 'uuid', nullable: true })
  deleted_by?: string;

  @ManyToOne(() => EmailTemplate, (object) => object.email_campaigns)
  email_template: EmailTemplate[];

  @OneToMany(() => EmailCampaignGroup, (object) => object.email_campaign, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  email_campaign_groups: Promise<EmailCampaignGroup[]>;

  @OneToMany(() => EmailCampaignAudience, (object) => object.email_campaign, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  email_campaign_audiences: Promise<EmailCampaignAudience[]>;

  @OneToMany(() => EmailCampaignAnalytic, (object) => object.email_campaign, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  email_campaign_analytics: EmailCampaignAnalytic[];
}
