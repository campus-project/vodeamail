import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class DeleteDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  ids?: string[];

  @IsOptional()
  @IsBoolean()
  is_hard?: boolean;
}
