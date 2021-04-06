import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'uuid', length: 36 })
  organization_id: string;

  @Column({ type: 'uuid', length: 36 })
  role_id: string;

  @Column({ type: 'datetime', nullable: true })
  email_verified_at?: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @DeleteDateColumn()
  deleted_at?: string;

  @ManyToOne(() => Organization, (object) => object.users)
  organization: Organization;

  @ManyToOne(() => Role, (object) => object.users)
  role: Role;
}
