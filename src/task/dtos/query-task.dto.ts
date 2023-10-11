import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryTaskDto {
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  categories: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  isCompleted: boolean;

  @IsString()
  @IsOptional()
  deadline: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit: number;
}
