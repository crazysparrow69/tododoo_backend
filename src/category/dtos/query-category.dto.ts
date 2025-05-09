import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dtos";

export class QueryCategoryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  color: string;
}
