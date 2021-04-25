import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Permission } from '../../../domain/entities/permission.entity';

export default class TransactionSeeder implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<any> {
    const transactions = [
      {
        name: 'Contact',
        permissions: [
          { name: 'contact-index', ability: 'index' },
          { name: 'contact-read', ability: 'read' },
          { name: 'contact-create', ability: 'create' },
          { name: 'contact-update', ability: 'update' },
          { name: 'contact-delete', ability: 'delete' },
        ],
      },
      {
        name: 'Group',
        permissions: [
          { name: 'group-index', ability: 'index' },
          { name: 'group-read', ability: 'read' },
          { name: 'group-create', ability: 'create' },
          { name: 'group-update', ability: 'update' },
          { name: 'group-delete', ability: 'delete' },
        ],
      },
      {
        name: 'Email Campaign',
        permissions: [
          { name: 'email-campaign-index', ability: 'index' },
          { name: 'email-campaign-read', ability: 'read' },
          { name: 'email-campaign-create', ability: 'create' },
          { name: 'email-campaign-update', ability: 'update' },
          { name: 'email-campaign-delete', ability: 'delete' },
        ],
      },
      {
        name: 'Email Template',
        permissions: [
          { name: 'email-template-index', ability: 'index' },
          { name: 'email-template-read', ability: 'read' },
          { name: 'email-template-create', ability: 'create' },
          { name: 'email-template-update', ability: 'update' },
          { name: 'email-template-delete', ability: 'delete' },
        ],
      },
      {
        name: 'Analytic',
        permissions: [
          { name: 'analytic-index', ability: 'index' },
          { name: 'analytic-read', ability: 'read' },
        ],
      },
      {
        name: 'Organization',
        permissions: [{ name: 'organization-index', ability: 'index' }],
      },
      {
        name: 'Role',
        permissions: [
          { name: 'role-index', ability: 'index' },
          { name: 'role-read', ability: 'read' },
          { name: 'role-create', ability: 'create' },
          { name: 'role-update', ability: 'update' },
          { name: 'role-delete', ability: 'delete' },
        ],
      },
      {
        name: 'Gate Setting',
        permissions: [
          { name: 'gate-setting-index', ability: 'index' },
          { name: 'gate-setting-read', ability: 'read' },
          { name: 'gate-setting-create', ability: 'create' },
          { name: 'gate-setting-update', ability: 'update' },
          { name: 'gate-setting-delete', ability: 'delete' },
        ],
      },
      {
        name: 'User',
        permissions: [
          { name: 'user-index', ability: 'index' },
          { name: 'user-read', ability: 'read' },
          { name: 'user-update', ability: 'update' },
        ],
      },
    ];

    for (const transaction of transactions) {
      const permissions = transaction.permissions;
      delete transaction.permissions;

      let transactionId = null;

      const currentTransaction: any = await connection
        .getRepository(Transaction)
        .createQueryBuilder()
        .where({
          name: transaction.name,
        })
        .getOne();

      if (currentTransaction) {
        transactionId = currentTransaction.id;
      } else {
        const result = await connection
          .createQueryBuilder()
          .insert()
          .into(Transaction)
          .values([transaction])
          .execute();

        transactionId = result.identifiers[0].id;
      }

      for (const permission of permissions) {
        const isExists =
          (await connection
            .getRepository(Permission)
            .createQueryBuilder()
            .where({ transaction_id: transactionId, name: permission.name })
            .getCount()) > 0;

        if (!isExists) {
          await connection
            .createQueryBuilder()
            .insert()
            .into(Permission)
            .values([
              {
                ...permission,
                transaction_id: transactionId,
              },
            ])
            .execute();
        }
      }
    }
  }
}
