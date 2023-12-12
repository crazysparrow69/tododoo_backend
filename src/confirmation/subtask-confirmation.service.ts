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
  ) {
    const createdSubtConf = await this.subtaskConfirmationModel.create({
      _id: new Types.ObjectId(),
      userId,
      ...dto,
    });
    const populateParams = {
      path: 'subtaskId',
      select: 'userId title description deadline',
    };

    return createdSubtConf.populate(populateParams);
  }

  removeSubtaskConfirmation(
    userId: string,
    subtaskId: string,
  ): Promise<SubtaskConfirmation> {
    return this.subtaskConfirmationModel.findOneAndDelete({
      subtaskId: new Types.ObjectId(subtaskId),
      userId,
    });
  }
}
