import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  ActorDeleteWithOrganizationDto,
  ActorOrganizationDto,
  FindAllWithOrganizationDto,
  FindOneWithOrganizationDto,
} from 'vnest-core';

export class FindAllGroupDto extends FindAllWithOrganizationDto {
  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;

  @IsOptional()
  @IsUUID('4')
  contact_id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  contact_ids?: string[];
}

export class FindOneGroupDto extends FindOneWithOrganizationDto {
  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;

  @IsOptional()
  @IsUUID('4')
  contact_id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  contact_ids?: string[];
}

export class CreateGroupDto extends ActorOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;

  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  contact_ids: string[];
}

export class UpdateGroupDto extends CreateGroupDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteGroupDto extends ActorDeleteWithOrganizationDto {}
