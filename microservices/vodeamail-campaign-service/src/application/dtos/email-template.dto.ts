import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  DeleteWithOrganizationDto,
  FindAllWithOrganizationDto,
  FindOneWithOrganizationDto,
  OrganizationDto,
} from '../../@vodea/dtos';

export class FindAllEmailTemplateDto extends FindAllWithOrganizationDto {}

export class FindOneEmailTemplateDto extends FindOneWithOrganizationDto {}

export class CreateEmailTemplateDto extends OrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateEmailTemplateDto extends CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteEmailTemplateDto extends DeleteWithOrganizationDto {}
