import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export class CreateSubtaskConfirmationDto {
  @IsString()
  assigneeId: string;

  @IsString()
  @Transform(({ value }) => {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid subtaskId');
    }
    return value;
  })
  subtaskId: Types.ObjectId;
}
