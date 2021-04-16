import {
  IsArray,
  IsBoolean,
  IsEmail,
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

export class FindAllContactDto extends FindAllWithOrganizationDto {
  @IsOptional()
  @IsBoolean()
  is_subscribed?: boolean;

  @IsOptional()
  @IsUUID('4')
  group_id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  group_ids?: string[];
}

export class FindOneContactDto extends FindOneWithOrganizationDto {
  @IsOptional()
  @IsBoolean()
  is_subscribed?: boolean;

  @IsOptional()
  @IsUUID('4')
  group_id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  group_ids?: string[];
}

export class CreateContactDto extends ActorOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  mobile_phone?: string;

  @IsOptional()
  @IsString()
  address_line_1?: string;

  @IsOptional()
  @IsString()
  address_line_2?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  group_ids: string[];
}

export class UpdateContactDto extends CreateContactDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteContactDto extends ActorDeleteWithOrganizationDto {}
