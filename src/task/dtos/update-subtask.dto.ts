import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  Length,
  ArrayMaxSize,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

import { Category } from '../../category/category.schema';

export class UpdateSubtaskDto {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  title: string;

  @IsString()
  @IsOptional()
  @Length(3, 1000)
  description: string;

  @IsArray()
  @ArrayMaxSize(5)
  @IsOptional()
  @Transform(({ value }) => {
    for (const id of value) {
      if (typeof id !== 'string' || !Types.ObjectId.isValid(id))
        throw new BadRequestException(
          'categories must be an array of ObjectId',
        );
    }
    return value;
  })
  categories: Category[];

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(10)
  links: string[];

  @IsBoolean()
  @IsOptional()
  rejected: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) {
      return null;
    }
    const date = new Date(value);
    if (typeof value !== 'string' || isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format for deadline');
    }

    return date;
  })
  deadline: null | Date;
}
