import { IsNumber, IsString, Length, Min } from "class-validator";

export class CreateQuarterDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsNumber()
  @Min(0)
  start: number;

  @IsNumber()
  @Min(0)
  end: number;
}
