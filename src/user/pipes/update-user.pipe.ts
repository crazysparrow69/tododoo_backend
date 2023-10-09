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

    if (value.avatar)
      throw new BadRequestException(
        'You cannot change avatar through this endpoint',
      );

    if (value.tasks)
      throw new BadRequestException(
        'You cannot change tasks through this endpoint',
      );

    if (value.categories)
      throw new BadRequestException(
        'You cannot change categories through this endpoint',
      );

    if (value.createdAt)
      throw new BadRequestException('You cannot change createdAt');

    if (value.updatedAt)
      throw new BadRequestException('You cannot change updatedAt');

    return value;
  }
}
