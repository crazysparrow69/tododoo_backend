import { IsString } from "class-validator";

export class CreateTagDto {
  @IsString()
  title: string;

  @IsString()
  color: string;
}
