import { IsOptional, IsString } from "class-validator";

export class QueryCategoryDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  color: string;

  @IsString()
  @IsOptional()
  page: number;

  @IsString()
  @IsOptional()
  limit: number;
}
