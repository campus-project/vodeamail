import { FindOneDto } from '../../dtos';

export interface BuildFindOneOptionInterface {
  options: FindOneDto;
  cacheable?: boolean;
}
