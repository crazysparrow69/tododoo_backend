import { BadRequestException } from "@nestjs/common";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

import { Category } from "../../category/category.schema";
import { Types } from "mongoose";

export class CreateTaskDto {
  @IsString()
  @Length(3, 50)
  title: string;

  @IsString()
  @Length(3, 1000)
  description: string;

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
  @Transform(({ value }) => {
    if (value === null) {
      return null;
    }
    const date = new Date(value);
    if (typeof value !== "string" || isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date format for deadline");
    }

    return date;
  })
  deadline: Date;
}

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
  @ArrayMaxSize(5)
  @IsOptional()
  @Transform(({ value }) => {
    for (const id of value) {
      if (typeof id !== "string" || !Types.ObjectId.isValid(id))
        throw new BadRequestException(
          "categories must be an array of ObjectId"
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

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) {
      return null;
    }
    const date = new Date(value);
    if (typeof value !== "string" || isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date format for deadline");
    }

    return date;
  })
  deadline: null | Date;
}

export class QueryTaskDto {
  @IsArray()
  @IsOptional()
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
    } catch (err) {
      throw new BadRequestException("isCompleted must be boolean");
    }
  })
  isCompleted: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    const deadlines = [
      "day",
      "week",
      "month",
      "year",
      "outdated",
      "all",
      "nodeadline",
    ];
    for (const deadline of deadlines) {
      if (value === deadline) return value;
    }
    throw new BadRequestException("deadline is invalid");
  })
  deadline: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
