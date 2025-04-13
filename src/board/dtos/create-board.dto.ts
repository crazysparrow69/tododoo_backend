import { IsString, Length } from "class-validator";

export class CreateBoardDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsString()
  @Length(0, 1000)
  description: string;
}
