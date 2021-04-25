import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { GateSettingPermission } from './gate-setting-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  transaction_id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar' })
  ability: string;

  @ManyToOne(() => Transaction, (object) => object.permissions)
  transaction: Transaction;

  @OneToMany(() => GateSettingPermission, (object) => object.gate_setting, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  gate_setting_permissions: GateSettingPermission[];
}
