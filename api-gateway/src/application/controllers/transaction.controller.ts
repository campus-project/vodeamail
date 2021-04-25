import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  FindAllQueryDto,
  FindOneQueryDto,
  paginationTransformer,
  User,
} from 'vnest-core';
import { TransactionService } from '../../domain/services/transaction.service';
import {
  FindAllTransactionQueryDto,
  FindOneTransactionQueryDto,
} from '../dtos/transaction.dto';

@Controller('transaction')
export class TransactionController {
  @Inject('AUTH_TRANSACTION_SERVICE')
  private readonly transactionService: TransactionService;

  @Get()
  async findAll(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllTransactionQueryDto,
  ) {
    const payload = this.buildFindAllPayload(query, {
      organization_id: organizationId,
    });

    const data = await this.transactionService.findAll(payload);

    if (query.per_page === undefined) {
      return { data };
    }

    const total = await this.transactionService.findAllCount(payload);

    return paginationTransformer(data, total);
  }

  @Get(':id')
  async findOne(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Query() query: FindOneTransactionQueryDto,
  ) {
    const payload = this.buildFindOnePayload(query, {
      organization_id: organizationId,
    });

    const data = await this.transactionService.findOne(payload);

    if (!data) {
      throw new NotFoundException(`Could not find resource ${id}.`);
    }

    return { data };
  }

  protected buildFindAllPayload = (
    query: FindAllQueryDto,
    params: any = {},
  ) => {
    const {
      search,
      relations,
      per_page,
      page,
      order_by,
      sorted_by,
      with_deleted,
    } = query;

    const perPageValue = parseInt(per_page);
    const pageValue = parseInt(page);

    Object.assign(params, {
      search,
      relations,
      per_page: isNaN(perPageValue) ? undefined : perPageValue,
      page: isNaN(pageValue) ? undefined : pageValue,
      order_by,
      sorted_by,
      with_deleted:
        with_deleted === undefined
          ? undefined
          : ['true', '1'].includes(with_deleted.toLowerCase()),
    });

    return params;
  };

  protected buildFindOnePayload = (
    query: FindOneQueryDto,
    params: any = {},
  ) => {
    const { relations, with_deleted } = query;

    Object.assign(params, {
      relations,
      with_deleted:
        with_deleted === undefined
          ? undefined
          : ['true', '1'].includes(with_deleted.toLowerCase()),
    });

    return params;
  };
}
