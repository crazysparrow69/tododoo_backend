import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  Length,
  ArrayMaxSize,
} from 'class-validator';

import { Category } from '../../category/category.schema';

export class CreateSubtaskDto {
  @IsString()
  @Length(3, 50)
  title: string;

  @IsString()
  @Length(3, 1000)
  description: string;

  @IsString()
  assigneeId: string;

  @IsArray()
  @ArrayMaxSize(5)
  @IsOptional()
  categories: Category[];

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;

  @IsArray()
  @ArrayMaxSize(10)
  @IsOptional()
  links: Array<string>;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  deadline: Date;
}