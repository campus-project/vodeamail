import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'summary_contacts',
  expression: `
    SELECT
      contacts.id contact_id,
      COALESCE ( contact_groups.total_group, 0 ) total_group 
    FROM
      contacts
    LEFT JOIN ( 
      SELECT 
        contact_groups.contact_id, 
        COUNT( DISTINCT contact_groups.group_id ) AS total_group 
      FROM
        contact_groups
        JOIN groups ON groups.id = contact_groups.group_id AND groups.deleted_at IS NULL
      GROUP BY 
        contact_groups.contact_id 
    ) contact_groups ON contact_groups.contact_id = contacts.id`,
})
export class SummaryContactView {
  @ViewColumn()
  contact_id: string;

  @ViewColumn()
  total_contact: number;
}
