import { FindAllQueryDto, FindOneQueryDto } from 'vnest-core';

export class FindAllContactQueryDto extends FindAllQueryDto {
  group_id: string;
  group_ids: string[];
  is_subscribed: string;
}

export class FindOneContactQueryDto extends FindOneQueryDto {
  group_id: string;
  group_ids: string[];
  is_subscribed: string;
}
