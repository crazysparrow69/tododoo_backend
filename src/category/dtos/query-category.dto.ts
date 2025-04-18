import { IsOptional, IsString } from "class-validator";

export class QueryCategoryDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  color: string;

  @IsOptional()
  @IsString()
  page: number;

  @IsOptional()
  @IsString()
  limit: number;
}
