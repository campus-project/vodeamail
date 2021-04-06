import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class GenerateAccessTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;
}

export class GenerateRefreshTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;
}

export class AccessTokenDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;
}

export class DecodedAccessToken {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsNumber()
  iat: number;

  @IsNotEmpty()
  @IsNumber()
  exp: number;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

export class DecodedRefreshToken {
  @IsNotEmpty()
  @IsNumber()
  iat: number;

  @IsNotEmpty()
  @IsNumber()
  exp: number;

  @IsNotEmpty()
  @IsString()
  sub: string;

  @IsNotEmpty()
  @IsString()
  jti: string;
}
