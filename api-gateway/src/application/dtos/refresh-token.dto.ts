import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { FindOneDto } from '../../@vodea/dtos';

export class FindOneRefreshTokenDto extends FindOneDto {}

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;

  @IsNotEmpty()
  @IsNumber()
  ttl: number;
}

export class RevokeRefreshTokenDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsOptional()
  @IsUUID('4')
  user_id?: string;
}
