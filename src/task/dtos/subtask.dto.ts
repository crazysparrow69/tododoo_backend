import { BadRequestException } from "@nestjs/common";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { Category } from "src/category/category.schema";
import { SUBTASK } from "src/common/constants";

export class CreateSubtaskDto {
  @IsString()
  @Length(SUBTASK.TITLE.MIN, SUBTASK.TITLE.MAX)
  title: string;

  @IsString()
  @Length(SUBTASK.DESCRIPTION.MIN, SUBTASK.DESCRIPTION.MAX)
  description: string;

  @IsMongoId()
  assigneeId: string;

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(SUBTASK.LINKS.MAX)
  links: Array<string>;

  @IsOptional()
  @IsDate()
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

export class UpdateSubtaskDto {
  @IsOptional()
  @IsString()
  @Length(SUBTASK.TITLE.MIN, SUBTASK.TITLE.MAX)
  title: string;

  @IsOptional()
  @IsString()
  @Length(SUBTASK.DESCRIPTION.MIN, SUBTASK.DESCRIPTION.MAX)
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(SUBTASK.CATEGORIES.MAX)
  @IsMongoId({ each: true })
  categories: Category[];

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(SUBTASK.LINKS.MAX)
  links: string[];

  @IsOptional()
  @IsBoolean()
  isRejected: boolean;

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
