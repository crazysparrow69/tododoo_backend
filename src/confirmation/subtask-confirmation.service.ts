import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SubtaskConfirmation } from './subtask-confirmation.schema';
import { CreateSubtaskConfirmationDto } from './dtos/create-subtask-confirmation.dto';

@Injectable()
export class SubtaskConfirmService {
  constructor(
    @InjectModel(SubtaskConfirmation.name)
    private subtaskConfirmationModel: Model<SubtaskConfirmation>,
  ) {}

  async createSubtaskConfirmation(userId: string, dto: CreateSubtaskConfirmationDto) {
    return this.subtaskConfirmationModel.create({
      userId,
      ...dto
    });
  }
}
