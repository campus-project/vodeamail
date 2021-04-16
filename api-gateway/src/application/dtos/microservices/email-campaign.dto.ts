import { FindAllQueryDto, FindOneQueryDto } from 'vnest-core';

export class FindAllEmailCampaignQueryDto extends FindAllQueryDto {
  status: string;
}

export class FindOneEmailCampaignQueryDto extends FindOneQueryDto {
  status: string;
}
