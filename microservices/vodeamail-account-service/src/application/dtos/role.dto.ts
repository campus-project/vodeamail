import {
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
} from '../../@vodea/dtos';

export class FindAllRoleDto extends FindAllWithOrganizationDto {
  @IsOptional()
  @IsBoolean()
  is_special?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class FindOneRoleDto extends FindOneWithOrganizationDto {
  @IsOptional()
  @IsBoolean()
  is_special?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class CreateRoleDto extends ActorOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  is_special?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdateRoleDto extends CreateRoleDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteRoleDto extends ActorDeleteWithOrganizationDto {}
