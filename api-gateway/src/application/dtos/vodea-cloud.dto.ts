import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VodeaCloudSignInDto {
  @IsNotEmpty()
  @IsString()
  redirect_uri: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class VodeaCloudTokenDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsNotEmpty()
  @IsString()
  refresh_token: string;

  @IsNotEmpty()
  @IsNumber()
  expires_in: number;

  @IsNotEmpty()
  @IsString()
  token_type: string;
}

class VodeaCloudAccountAdditionalDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;

  @IsNotEmpty()
  @IsString()
  organization_name: string;

  @IsOptional()
  @IsString()
  organization_address?: string;

  @IsOptional()
  @IsString()
  organization_telephone?: string;

  @IsOptional()
  @IsString()
  organization_fax?: string;

  @IsNotEmpty()
  @IsUUID('4')
  role_id: string;

  @IsNotEmpty()
  @IsString()
  role_name: string;

  @IsNotEmpty()
  @IsBoolean()
  role_is_special: string;
}

export class VodeaCloudAccountDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  avatar: string;

  @Type(() => VodeaCloudAccountAdditionalDto)
  additional: VodeaCloudAccountAdditionalDto;
}

export class SignInRo {
  @IsNotEmpty()
  @IsString()
  token_type: string;

  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsNotEmpty()
  @IsString()
  refresh_token: string;

  @IsNotEmpty()
  @IsNumber()
  expires_in: number;
}
