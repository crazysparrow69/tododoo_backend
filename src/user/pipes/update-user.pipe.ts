import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UpdateUserPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.password)
      throw new BadRequestException(
        'You cannot change password through this endpoint',
      );

    if (value._id) throw new BadRequestException('You cannot change _id');

    return value;
  }
}
