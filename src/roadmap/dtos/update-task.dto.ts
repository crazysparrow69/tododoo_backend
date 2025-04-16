import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  start: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  end: number;
}
