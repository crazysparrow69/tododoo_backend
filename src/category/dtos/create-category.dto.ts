import { IsString, Length } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @Length(3, 20)
  title: string;

  @IsString()
  @Length(3, 20)
  color: string;
}
