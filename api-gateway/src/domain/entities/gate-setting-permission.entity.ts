import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GateSetting } from './gate-setting.entity';
import { Permission } from './permission.entity';

@Entity('gate_setting_permissions')
export class GateSettingPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gate_setting_id: string;

  @Column({ type: 'uuid' })
  permission_id: string;

  @ManyToOne(() => GateSetting, (object) => object.gate_setting_permissions)
  gate_setting: GateSetting;

  @ManyToOne(() => Permission, (object) => object.gate_setting_permissions)
  permission: Permission;
}
