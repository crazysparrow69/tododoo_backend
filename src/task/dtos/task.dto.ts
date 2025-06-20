import { BadRequestException } from "@nestjs/common";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

import { Category } from "../../category/category.schema";
import { TASK } from "src/common/constants";
import { Types } from "mongoose";
import { PaginationDto } from "src/common/dtos";

export class CreateTaskDto {
  @IsString()
  @Length(TASK.TITLE.MIN, TASK.TITLE.MAX)
  title: string;

  @IsString()
  @Length(TASK.DESCRIPTION.MIN, TASK.DESCRIPTION.MAX)
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TASK.CATEGORIES.MAX)
  categories: Category[];

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TASK.LINKS.MAX)
  links: string[];

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    if (value === null) return null;
    const date = new Date(value);
    if (typeof value !== "string" || isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date format for deadline");
    }
    return date;
  })
  deadline: Date;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @Length(TASK.TITLE.MIN, TASK.TITLE.MAX)
  title: string;

  @IsOptional()
  @IsString()
  @Length(TASK.DESCRIPTION.MIN, TASK.DESCRIPTION.MAX)
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TASK.CATEGORIES.MAX)
  @IsMongoId({ each: true })
  categories: Category[];

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TASK.LINKS.MAX)
  links: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) return null;
    const date = new Date(value);
    if (typeof value !== "string" || isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date format for deadline");
    }
    return date;
  })
  deadline: Date | null;
}

export class QueryTaskDto extends PaginationDto {
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      const parsed = JSON.parse(value);
      for (const id of parsed) {
        if (typeof id !== "string" || !Types.ObjectId.isValid(id))
          throw new Error();
      }
      return parsed;
    } catch (err) {
      throw new BadRequestException("categories must be an array of ObjectId");
    }
  })
  categories: string[];

  @IsOptional()
  @Transform(({ value }) => {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "boolean") throw new Error();
      return parsed;
    } catch {
      throw new BadRequestException("isCompleted must be boolean");
    }
  })
  isCompleted: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    const allowed = [
      "day",
      "week",
      "month",
      "year",
      "outdated",
      "all",
      "nodeadline",
    ];
    if (allowed.includes(value)) return value;

    throw new BadRequestException("deadline is invalid");
  })
  deadline: string;
}
