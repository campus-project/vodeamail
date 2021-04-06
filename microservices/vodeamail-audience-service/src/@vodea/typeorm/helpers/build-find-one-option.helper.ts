import { FindOneOptions } from 'typeorm';
import { BuildFindOneOptionInterface } from '../interfaces';

export const buildFindOneQueryOption = ({
  options,
  cacheable = false,
}: BuildFindOneOptionInterface): FindOneOptions => {
  return {
    where: {
      id: options.id,
    },
    cache: cacheable,
    relations: options.relations || [],
  };
};
