import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'summary_roles',
  expression: `
    SELECT
      roles.id role_id,
      COALESCE ( users.total_user, 0 ) total_user 
    FROM
      roles
    LEFT JOIN ( 
      SELECT 
        users.role_id, 
        COUNT( DISTINCT users.id ) AS total_user 
      FROM
        users
      GROUP BY 
        users.role_id 
    ) users ON users.role_id = roles.id`,
})
export class SummaryRoleView {
  @ViewColumn()
  role_id: string;

  @ViewColumn()
  total_user: number;
}
