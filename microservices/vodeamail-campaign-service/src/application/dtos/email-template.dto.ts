import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  ActorDeleteWithOrganizationDto,
  ActorOrganizationDto,
  FindAllWithOrganizationDto,
  FindOneWithOrganizationDto,
} from 'vnest-core';

export class FindAllEmailTemplateDto extends FindAllWithOrganizationDto {}

export class FindOneEmailTemplateDto extends FindOneWithOrganizationDto {}

export class CreateEmailTemplateDto extends ActorOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  design: string;

  @IsNotEmpty()
  @IsString()
  html: string;

  @IsNotEmpty()
  @IsString()
  example_value_tags: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;
}

export class UpdateEmailTemplateDto extends CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteEmailTemplateDto extends ActorDeleteWithOrganizationDto {}
