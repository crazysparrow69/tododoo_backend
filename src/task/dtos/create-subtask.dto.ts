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
import { BadRequestException } from '@nestjs/common';

export class CreateSubtaskDto {
  @IsString()
  @Length(3, 50)
  title: string;

  @IsString()
  @Length(3, 1000)
  description: string;

  @IsString()
  assigneeId: string;

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;

  @IsArray()
  @ArrayMaxSize(10)
  @IsOptional()
  links: Array<string>;

  @IsDate()
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
  deadline: Date;
}
