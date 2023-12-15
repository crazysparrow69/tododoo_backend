import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { SubtaskConfirmation } from './subtask-confirmation.schema';
import { CreateSubtaskConfirmationDto } from './dtos/create-subtask-confirmation.dto';

@Injectable()
export class SubtaskConfirmService {
  constructor(
    @InjectModel(SubtaskConfirmation.name)
    private subtaskConfirmationModel: Model<SubtaskConfirmation>,
  ) {}

  async createSubtaskConfirmation(
    userId: string,
    dto: CreateSubtaskConfirmationDto,
  ): Promise<SubtaskConfirmation> {
    const createdSubtConf = await this.subtaskConfirmationModel.create({
      _id: new Types.ObjectId(),
      userId,
      ...dto,
      assigneeId: new Types.ObjectId(dto.assigneeId),
    });
    const populateParams = [
      {
        path: 'subtaskId',
        select: 'title description deadline',
      },
      {
        path: 'userId',
        select: 'username avatar',
      },
    ];

    return createdSubtConf.populate(populateParams);
  }

  getSubtaskConfirmations(
    userId: Types.ObjectId,
  ): Promise<SubtaskConfirmation[]> {
    return this.subtaskConfirmationModel
      .find({
        assigneeId: userId,
      })
      .select(['-__v', '-updatedAt'])
      .populate([
        {
          path: 'subtaskId',
          select: 'title description deadline',
        },
        {
          path: 'userId',
          select: 'username avatar',
        },
      ]);
  }

  removeSubtaskConfirmation(subtaskId: string): Promise<SubtaskConfirmation> {
    return this.subtaskConfirmationModel.findOneAndDelete({
      subtaskId: new Types.ObjectId(subtaskId),
    });
  }
}
