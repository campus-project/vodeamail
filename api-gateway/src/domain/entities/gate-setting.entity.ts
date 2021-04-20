import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GateSettingPermission } from './gate-setting-permission.entity';

@Entity('gate_settings')
export class GateSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by?: string;

  @Column({ type: 'uuid', nullable: true })
  deleted_by?: string;

  @OneToMany(() => GateSettingPermission, (object) => object.gate_setting, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  gate_setting_permissions: GateSettingPermission[];
}
