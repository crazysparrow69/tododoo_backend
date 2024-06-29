import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CreateSubtaskConfirmationDto } from "./dtos";
import { SubtaskConfirmation } from "./subtask-confirmation.schema";

@Injectable()
export class SubtaskConfirmService {
  constructor(
    @InjectModel(SubtaskConfirmation.name)
    private subtaskConfirmationModel: Model<SubtaskConfirmation>
  ) {}

  async createSubtaskConfirmation(
    userId: string,
    dto: CreateSubtaskConfirmationDto
  ): Promise<SubtaskConfirmation> {
    const createdSubtConf = await this.subtaskConfirmationModel.create({
      _id: new Types.ObjectId(),
      userId,
      ...dto,
      assigneeId: new Types.ObjectId(dto.assigneeId),
    });
    const populateParams = [
      {
        path: "subtaskId",
        select: "title description deadline",
      },
      {
        path: "userId",
        select: "username avatar",
      },
    ];

    return createdSubtConf.populate(populateParams);
  }

  async getSubtaskConfirmations(
    userId: Types.ObjectId
  ): Promise<SubtaskConfirmation[]> {
    const foundConfirmations = await this.subtaskConfirmationModel
      .find({
        assigneeId: userId,
      })
      .lean()
      .select(["-__v", "-updatedAt"])
      .populate([
        {
          path: "subtaskId",
          select: "title description deadline",
        },
        {
          path: "userId",
          select: "username avatar",
        },
      ]);

    return foundConfirmations.map((c) => ({
      ...c,
      creator: {
        _id: c.userId._id.toString(),
        username: (c.userId as any).username,
        avatar: (c.userId as any)?.avatar.url || "",
      },
    }));
  }

  removeSubtaskConfirmation(subtaskId: string): Promise<SubtaskConfirmation> {
    return this.subtaskConfirmationModel.findOneAndDelete({
      subtaskId: new Types.ObjectId(subtaskId),
    });
  }
}
