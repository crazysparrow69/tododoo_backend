import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  Length,
} from 'class-validator';

import { Category } from 'src/category/category.schema';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  title: string;

  @IsString()
  @IsOptional()
  @Length(3, 1000)
  description: string;

  @IsArray()
  @IsOptional()
  categories: Category[];

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;

  @IsArray()
  @IsOptional()
  @Length(1, 10)
  links: Array<string>;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  deadline: Date;
}
