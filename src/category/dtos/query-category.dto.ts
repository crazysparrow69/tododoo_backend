import { IsString, IsOptional } from 'class-validator';

export class QueryCategoryDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  color: string;
}
