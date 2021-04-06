import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  FindAllWithOrganizationDto,
  FindOneWithOrganizationDto,
} from '../../@vodea/dtos';
import {
  ActorDeleteWithOrganizationDto,
  ActorOrganizationDto,
} from '../../@vodea/dtos/actor.dto';

export class FindAllEmailCampaignDto extends FindAllWithOrganizationDto {}

export class FindOneEmailCampaignDto extends FindOneWithOrganizationDto {}

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
  @IsDateString()
  sent_at: string;

  @IsNotEmpty()
  @IsBoolean()
  is_directly_scheduled: boolean;

  @IsNotEmpty()
  @IsUUID('4')
  email_template_id: string;

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
