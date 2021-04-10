import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  ActorDeleteWithOrganizationDto,
  ActorOrganizationDto,
  FindAllWithOrganizationDto,
  FindOneWithOrganizationDto,
} from '../../@vodea/dtos';

export class FindAllEmailTemplateDto extends FindAllWithOrganizationDto {}

export class FindOneEmailTemplateDto extends FindOneWithOrganizationDto {}

export class CreateEmailTemplateDto extends ActorOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID('4')
  image_id?: string;

  @IsOptional()
  @IsString()
  image_url: string;

  @IsNotEmpty()
  @IsString()
  design: string;
}

export class UpdateEmailTemplateDto extends CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteEmailTemplateDto extends ActorDeleteWithOrganizationDto {}
