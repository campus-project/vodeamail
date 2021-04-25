import {
  ActorDeleteWithOrganizationDto,
  ActorOrganizationDto,
  FindAllQueryDto,
  FindAllWithOrganizationDto,
  FindOneWithOrganizationDto,
} from 'vnest-core';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindAllGateSettingQueryDto extends FindAllQueryDto {
  role_id: string;
}

export class FindOneGateSettingQueryDto extends FindAllQueryDto {
  role_id: string;
}

export class FindAllGateSettingDto extends FindAllWithOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  role_id?: string;
}

export class FindOneGateSettingDto extends FindOneWithOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  role_id?: string;
}

export class CreateGateSettingDto extends ActorOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  valid_from: string;

  @IsNotEmpty()
  @IsUUID('4')
  role_id: string;

  @IsNotEmpty()
  @IsUUID('4', { each: true })
  permission_ids: string[];
}

export class UpdateGateSettingDto extends CreateGateSettingDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteGateSettingDto extends ActorDeleteWithOrganizationDto {}
