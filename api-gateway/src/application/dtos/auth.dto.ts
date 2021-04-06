import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GenerateAccessTokenAndRefreshTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;
}

export class GenerateAccessTokenFromRefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
