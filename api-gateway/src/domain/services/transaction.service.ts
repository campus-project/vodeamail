import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { buildFindAllQueryBuilder } from 'vnest-core';
import * as _ from 'lodash';

import {
  FindAllTransactionDto,
  FindOneTransactionDto,
} from '../../application/dtos/transaction.dto';
import { Transaction } from '../entities/transaction.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class TransactionService {
  //entity
  @InjectRepository(Transaction)
  private readonly transactionRepository: Repository<Transaction>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  async findAll(options: FindAllTransactionDto): Promise<Transaction[]> {
    const { relations } = options;
    const qb = this.transactionRepository
      .createQueryBuilder('transactions')
      .select('transactions.*');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    let data = await builder.execute();

    //relations
    if (relations !== undefined && relations.length) {
      const transactionIds = [];

      const relationValues = {
        permissions: undefined,
      };

      data.forEach((transaction) => {
        transactionIds.push(transaction.id);
      });

      //permissions
      if (relations.indexOf('permissions') !== -1) {
        relationValues.permissions = await this.permissionRepository.find({
          where: { transaction_id: In([...new Set(transactionIds)]) },
        });
      }

      data = data.map((transaction) => {
        if (relationValues.permissions !== undefined) {
          const permissions = [];
          relationValues.permissions.forEach((permission) => {
            if (permission.transaction_id === transaction.id) {
              permissions.push(permission);
            }
          });

          transaction.permissions = permissions;
        }

        return transaction;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllTransactionDto): Promise<number> {
    const qb = this.transactionRepository.createQueryBuilder('transactions');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneTransactionDto): Promise<Transaction> {
    const data = await this.findAll(options);

    return _.head(data);
  }

  protected makeFilter(
    builder: SelectQueryBuilder<Transaction>,
    options: FindOneTransactionDto | FindAllTransactionDto,
  ): SelectQueryBuilder<Transaction> {
    const {} = options;

    //nothing action here

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<Transaction>,
    { search }: FindAllTransactionDto,
  ): SelectQueryBuilder<Transaction> {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('transactions.name LIKE :search', params);
        }),
      );
    }

    return builder;
  }
}
