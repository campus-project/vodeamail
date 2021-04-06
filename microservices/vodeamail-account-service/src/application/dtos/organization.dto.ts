import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { FindAllDto, FindOneDto } from '../../@vodea/dtos';
import {
  ActorDeleteWithOrganizationDto,
  ActorDto,
} from '../../@vodea/dtos/actor.dto';

export class FindAllOrganizationDto extends FindAllDto {}

export class FindOneOrganizationDto extends FindOneDto {}

export class CreateOrganizationDto extends ActorDto {
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

export class DeleteOrganizationDto extends ActorDeleteWithOrganizationDto {}
