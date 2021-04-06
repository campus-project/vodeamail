import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  DeleteWithOrganizationDto,
  FindAllWithOrganizationDto,
  FindOneDto,
  FindOneWithOrganizationDto,
  OrganizationDto,
} from '../../@vodea/dtos';

export class FindAllUserDto extends FindAllWithOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  role_id?: string;
}

export class FindOneUserDto extends FindOneWithOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  role_id?: string;
}

export class FindOneUserBypassOrganizationDto extends FindOneDto {
  @IsOptional()
  @IsUUID('4')
  role_id?: string;
}

export class CreateUserDto extends OrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;

  @IsNotEmpty()
  @IsUUID('4')
  role_id: string;
}

export class UpdateUserDto extends CreateUserDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteUserDto extends DeleteWithOrganizationDto {}
