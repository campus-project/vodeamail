import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'summary_groups',
  expression: `
    SELECT
      groups.id group_id,
      COALESCE ( contact_groups.total_contact, 0 ) total_contact 
    FROM
      groups
    LEFT JOIN ( 
      SELECT 
        contact_groups.group_id, 
        COUNT( DISTINCT contact_groups.contact_id ) AS total_contact 
      FROM
        contact_groups
      GROUP BY 
        contact_groups.group_id 
    ) contact_groups ON contact_groups.group_id = groups.id`,
})
export class SummaryGroupView {
  @ViewColumn()
  group_id: string;

  @ViewColumn()
  total_contact: number;
}
