import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  categories: Array<{}>;

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  deadline: Date;
}
