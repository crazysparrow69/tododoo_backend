import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UpdateCategoryPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value._id) throw new BadRequestException('You cannot change _id');

    return value;
  }
}