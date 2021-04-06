import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  DeleteWithOrganizationDto,
  FindAllDto,
  FindOneDto,
} from '../../@vodea/dtos';

export class FindAllOrganizationDto extends FindAllDto {}

export class FindOneOrganizationDto extends FindOneDto {}

export class CreateOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  fax?: string;
}

export class UpdateOrganizationDto extends CreateOrganizationDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteOrganizationDto extends DeleteWithOrganizationDto {}
