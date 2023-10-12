import {
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export class QueryTaskDto {
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      const parsed = JSON.parse(value);
      for (const id of parsed) {
        if (typeof id !== 'string' || !Types.ObjectId.isValid(id))
          throw new Error();
      }
      return parsed;
    } catch (err) {
      throw new BadRequestException('categories must be an array of ObjectId');
    }
  })
  categories: string[];

  @IsOptional()
  @Transform(({ value }) => {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'boolean') throw new Error();
      return parsed;
    } catch (err) {
      throw new BadRequestException('isCompleted must be boolean');
    }
  })
  isCompleted: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    const deadlines = ['day', 'week', 'month', 'year', 'outdated', 'all'];
    for (const deadline of deadlines) {
      if (value === deadline) return value;
    }
    throw new BadRequestException('deadline is invalid');
  })
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
