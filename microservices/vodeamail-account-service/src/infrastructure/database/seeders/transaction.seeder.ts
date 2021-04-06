import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

export default class TransactionSeeder implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<any> {
    const transactions = [
      {
        name: 'User',
        transaction_abilities: [
          { ability: 'index' },
          { ability: 'read' },
          { ability: 'create' },
          { ability: 'update' },
          { ability: 'delete' },
        ],
      },
      {
        name: 'Role',
        transaction_abilities: [
          { ability: 'index' },
          { ability: 'read' },
          { ability: 'create' },
          { ability: 'update' },
          { ability: 'delete' },
        ],
      },
    ];

    for (const transaction of transactions) {
      const abilities = transaction.transaction_abilities;

      delete transaction.transaction_abilities;

      const result = await connection
        .createQueryBuilder()
        .insert()
        .into('transactions')
        .values([transaction])
        .execute();

      await connection
        .createQueryBuilder()
        .insert()
        .into('transaction_abilities')
        .values(
          abilities.map((ability) => {
            ability['transaction_id'] = result.identifiers[0].id;

            return ability;
          }),
        )
        .execute();
    }
  }
}
