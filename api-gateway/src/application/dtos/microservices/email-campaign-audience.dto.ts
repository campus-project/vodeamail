import { FindAllQueryDto, FindOneQueryDto } from 'vnest-core';

export class FindAllEmailCampaignQueryDto extends FindAllQueryDto {
  status: string;
  group_id: string;
  group_ids: string[];
}

export class FindOneEmailCampaignQueryDto extends FindOneQueryDto {
  status: string;
  group_id: string;
  group_ids: string[];
}
