import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';
import { EmailCampaignAudience } from './email-campaign-audience.entity';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id?: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  design: string;

  @Column({ type: 'uuid', nullable: true })
  image_id?: string;

  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

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

  @OneToMany(() => EmailCampaign, (object) => object.email_template)
  email_campaigns: EmailCampaign[];

  @OneToMany(() => EmailCampaignAudience, (object) => object.email_template)
  email_campaign_audiences: EmailCampaignAudience[];
}
