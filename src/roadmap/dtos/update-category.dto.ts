import { IsOptional, IsString, Length } from "class-validator";

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  color: string;
}
