import { IsNumber, IsString, Length, Min } from "class-validator";

export class CreateMilestoneDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsNumber()
  @Min(0)
  position: string;
}
