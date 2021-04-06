import { IsOptional, IsString } from 'class-validator';

export class FindAllQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: number;

  @IsOptional()
  @IsString()
  per_page?: number;

  @IsOptional()
  @IsString()
  order_by?: string;

  @IsOptional()
  @IsString()
  sorted_by?: string;

  @IsOptional()
  @IsString()
  using?: string;

  @IsOptional()
  @IsString({ each: true })
  relations?: string[];
}
