import { FindManyOptions, In } from 'typeorm';
import { BuildFindAllOptionInterface } from '../interfaces';

export const buildFindAllQueryOption = ({
  options,
  cacheable = false,
}: BuildFindAllOptionInterface): FindManyOptions => {
  const isWithId = options.ids !== undefined || options.id !== undefined;

  const ids = options.ids === undefined ? [] : options.ids;
  if (options.id !== undefined) {
    ids.push(options.id);
  }

  const {
    page,
    per_page: perPage,
    order_by: orderBy,
    sorted_by: sortedBy,
  } = options;

  const pagination =
    perPage === undefined
      ? {}
      : {
          take: perPage,
          skip: page > 1 ? perPage * (page - 1) : 0,
        };

  const order = orderBy === undefined ? undefined : {};
  if (orderBy !== undefined) {
    order[orderBy] =
      typeof sortedBy === 'string' && sortedBy.toLowerCase() === 'desc'
        ? 'DESC'
        : 'ASC';
  }

  return {
    ...pagination,
    order,
    where: {
      ...(isWithId ? { id: In(ids) } : {}),
    },
    cache: cacheable,
    relations: options.relations || [],
  };
};
