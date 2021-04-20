import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sent_emails')
export class SentEmail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'varchar' })
  hash: string;

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar', nullable: true })
  from?: string;

  @Column({ type: 'varchar' })
  email_from: string;

  @Column({ type: 'varchar', nullable: true })
  to?: string;

  @Column({ type: 'varchar' })
  email_to: string;

  @Column({ type: 'text', nullable: true })
  headers: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'integer', unsigned: true, default: 0 })
  clicked: number;

  @Column({ type: 'integer', unsigned: true, default: 0 })
  opened: number;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @DeleteDateColumn()
  deleted_at?: string;
}
