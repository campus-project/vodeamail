import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
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

export class FindAllEmailCampaignDto extends FindAllWithOrganizationDto {
  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsUUID('4')
  group_id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  group_ids?: string[];
}

export class FindOneEmailCampaignDto extends FindOneWithOrganizationDto {
  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsUUID('4')
  group_id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  group_ids?: string[];
}

export class CreateEmailCampaignDto extends ActorOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsEmail()
  email_from: string;

  @IsNotEmpty()
  @IsUUID('4')
  email_template_id: string;

  @IsNotEmpty()
  @IsString()
  email_template_html: string;

  @IsNotEmpty()
  @IsDateString()
  sent_at: string;

  @IsNotEmpty()
  @IsBoolean()
  is_directly_scheduled: boolean;

  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  group_ids: string[];
}

export class UpdateEmailCampaignDto extends CreateEmailCampaignDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteEmailCampaignDto extends ActorDeleteWithOrganizationDto {}
