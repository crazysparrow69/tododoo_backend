import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
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