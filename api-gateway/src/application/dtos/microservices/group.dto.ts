import { FindAllQueryDto, FindOneQueryDto } from 'vnest-core';

export class FindAllGroupQueryDto extends FindAllQueryDto {
  contact_id: string;
  contact_ids: string[];
}

export class FindOneGroupQueryDto extends FindOneQueryDto {
  contact_id: string;
  contact_ids: string[];
}
