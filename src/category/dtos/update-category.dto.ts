import { IsOptional, IsString, Length } from "class-validator";

export class UpdateCategoryDto {
  @IsString()
  @Length(3, 20)
  @IsOptional()
  title: string;

  @IsString()
  @Length(3, 20)
  @IsOptional()
  color: string;
}
