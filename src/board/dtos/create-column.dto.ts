import { IsString, Length } from "class-validator";

export class CreateColumnDto {
  @IsString()
  @Length(1, 50)
  title: string;
}
