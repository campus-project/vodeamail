import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  FindAllWithOrganizationDto,
  FindOneWithOrganizationDto,
} from 'vnest-core';
import { OrganizationDto } from 'vnest-core/dist/dtos/organization.dto';

export class FindAllSentEmailDto extends FindAllWithOrganizationDto {}

export class FindOneSentEmailDto extends FindOneWithOrganizationDto {}

export class CreateSentEmailDto extends OrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsNotEmpty()
  @IsString()
  email_from: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsNotEmpty()
  @IsString()
  email_to: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
