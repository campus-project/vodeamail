import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'role_permissions',
  expression: `
    SELECT 
      gate_settings.role_id,
      permissions.name AS permission_name
    FROM 
      gate_settings
      JOIN gate_setting_permissions ON gate_setting_permissions.gate_setting_id = gate_settings.id
      JOIN permissions ON permissions.id = gate_setting_permissions.permission_id
    WHERE gate_settings.id = (
      SELECT 
        t2.id
      FROM 
        gate_settings AS t2
      WHERE 
        t2.role_id = gate_settings.role_id
        AND t2.valid_from <= now()
        AND t2.deleted_at IS NULL
      ORDER BY 
        t2.valid_from DESC, t2.created_at DESC
      LIMIT 1)`,
})
export class RolePermissionView {
  @ViewColumn()
  role_id: string;

  @ViewColumn()
  permission_name: string;
}
