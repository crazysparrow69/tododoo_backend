import { IsString, Length } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsString()
  @Length(1, 20)
  color: string;
}
