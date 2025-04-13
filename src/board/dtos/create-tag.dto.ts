import { IsString, Length } from "class-validator";

export class CreateTagDto {
  @IsString()
  @Length(1, 20)
  title: string;

  @IsString()
  @Length(1, 20)
  color: string;
}
