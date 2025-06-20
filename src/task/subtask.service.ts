import { forwardRef, Inject, Injectable } from "@nestjs/common";
import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { ClientSession, Model, Types } from "mongoose";

import {
  CreateSubtaskDto,
  QueryTaskDto,
  SubtaskAssignedDto,
  SubtaskFullDto,
  SubtaskResponseDto,
} from "./dtos";
import { Subtask, SubtaskDocument, Task } from "./schemas";
import { SubtaskMapperService } from "./subtask-mapper.service";
import { CheckStatusForSubtask, QueryParamsSubtask } from "./types";
import { Category } from "../category/category.schema";
import { getDeadlineFilter } from "../common";
import { NotificationGateway } from "../notification/notification.gateway";
import { NotificationService } from "../notification/notification.service";
import {
  NotificationServerEvents,
  NotificationTypes,
} from "../notification/types";
import { transaction } from "src/common/transaction";
import { ApiResponseStatus } from "src/common/interfaces";
import { getUserReferencePopulate } from "src/user/user.populate";
import { getSubtaskPopulate } from "./task.populate";

@Injectable()
export class SubtaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Subtask.name) private subtaskModel: Model<Subtask>,
    private readonly subtaskMapperService: SubtaskMapperService,
    @Inject(forwardRef(() => NotificationGateway))
    private notificationGateway: NotificationGateway,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async findByQuery(
    assigneeId: string,
    query: QueryTaskDto
  ): Promise<
    | {
        subtasks: SubtaskResponseDto[];
        currentPage: number;
        totalPages: number;
      }
    | SubtaskResponseDto[]
  > {
    const {
      page = 1,
      limit = 10,
      isCompleted = null,
      categories = null,
      deadline = null,
    } = query;

    const queryParams: QueryParamsSubtask = {
      assigneeId,
      isRejected: false,
      isConfirmed: true,
    };

    if (isCompleted !== null) {
      queryParams.isCompleted = isCompleted;
    }

    if (categories) {
      queryParams.categories = { $all: categories };
    }

    if (deadline && deadline !== "all") {
      queryParams.deadline = getDeadlineFilter(deadline);
    }

    const projection = {
      _id: 1,
      title: 1,
      description: 1,
      isCompleted: 1,
      categories: 1,
      links: 1,
      userId: 1,
      assigneeId: 1,
      dateOfCompletion: 1,
      deadline: 1,
    };
    if (query.page || query.limit) {
      const count = await this.subtaskModel.countDocuments(queryParams);
      const totalPages = Math.ceil(count / limit);

      const foundSubtasks = await this.subtaskModel
        .find(queryParams, projection)
        .populate(getSubtaskPopulate())
        .limit(limit)
        .skip((page - 1) * limit);

      return {
        subtasks: this.subtaskMapperService.toSubtasks(foundSubtasks),
        currentPage: page,
        totalPages,
      };
    } else {
      const foundSubtasks = await this.subtaskModel
        .find(queryParams, projection)
        .populate(getSubtaskPopulate());

      return this.subtaskMapperService.toSubtasks(foundSubtasks);
    }
  }

  async create(
    userId: string,
    taskId: string,
    createSubtaskDto: CreateSubtaskDto
  ): Promise<SubtaskAssignedDto> {
    const createdSubtask = await transaction<SubtaskDocument>(
      this.connection,
      async (session) => {
        const subtask = new this.subtaskModel({
          userId,
          taskId,
          dateOfCompletion: createSubtaskDto.isCompleted ? new Date() : null,
          isConfirmed:
            userId.toString() === createSubtaskDto.assigneeId.toString()
              ? true
              : false,
          ...createSubtaskDto,
        });
        await subtask.save({ session });

        await this.taskModel.findByIdAndUpdate(
          taskId,
          {
            $push: { subtasks: subtask._id },
          },
          { session }
        );

        return subtask;
      }
    );

    await createdSubtask.populate(getUserReferencePopulate("assigneeId"));

    return this.subtaskMapperService.toAssignedSubtask(createdSubtask);
  }

  async update(
    userId: Types.ObjectId,
    id: string,
    attrs: Partial<Subtask>
  ): Promise<SubtaskFullDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ObjectId");
    }

    try {
      const { foundSubtask, status } = await this.checkStatusForSubtask(
        userId,
        id
      );
      if (status === "assignee" && foundSubtask.isConfirmed === false) {
        throw new Error("Could not update subtask");
      }

      if ("isCompleted" in attrs) {
        if (attrs.isCompleted) {
          const notification = await this.notificationService.create({
            actionByUserId: userId,
            userId: new Types.ObjectId(
              foundSubtask.userId as unknown as string
            ),
            subtaskId: new Types.ObjectId(foundSubtask._id),
            type: NotificationTypes.SUBTASK_COMPLETED,
          });
          const socketId = this.notificationGateway.findConnectionByUserId(
            foundSubtask.userId as unknown as string
          );
          this.notificationGateway.io
            .to(socketId)
            .emit(NotificationServerEvents.NEW_NOTIFICATION, notification);
        }
        foundSubtask.isCompleted = attrs.isCompleted;
        foundSubtask.dateOfCompletion = attrs.isCompleted ? new Date() : null;
      }

      foundSubtask.links = attrs.links ?? foundSubtask.links;

      const { categories = null, ...restData } = attrs;

      if (status === "assignee") {
        foundSubtask.isRejected = attrs.isRejected ?? foundSubtask.isRejected;
      }

      if ((status === "assignee" || status === "gigachad") && categories) {
        const count = await this.categoryModel.countDocuments({
          _id: { $in: attrs.categories },
          userId,
        });

        if (count !== attrs.categories.length) {
          throw new BadRequestException(
            "Some categories listed in categories array don't exist or belong to the user"
          );
        }

        foundSubtask.categories = attrs.categories;
      }

      if (status === "owner" || status === "gigachad") {
        Object.assign(foundSubtask, restData);
      }

      await foundSubtask.save();
      await foundSubtask.populate([
        getUserReferencePopulate("userId"),
        getUserReferencePopulate("assigneeId"),
      ]);

      return this.subtaskMapperService.toFullSubtask(foundSubtask);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  async updateSubtaskIsConf(
    userId: Types.ObjectId,
    subtaskId: string,
    value: boolean
  ): Promise<ApiResponseStatus> {
    const foundSubtask = await this.subtaskModel.findById(
      new Types.ObjectId(subtaskId)
    );
    if (foundSubtask) {
      const assigneeId = foundSubtask.assigneeId.toString();
      if (userId.toString() === assigneeId) {
        foundSubtask.isConfirmed = value;
        if (value === false) foundSubtask.isRejected = true;
        await foundSubtask.save();
      }
    }
    return { success: true };
  }

  async remove(
    userId: Types.ObjectId,
    subtaskId: string,
    session?: ClientSession
  ): Promise<Subtask> {
    const { status } = await this.checkStatusForSubtask(userId, subtaskId);

    if (status === "gigachad" || status === "owner") {
      const removedSubtask = await this.subtaskModel.findOneAndDelete(
        {
          _id: new Types.ObjectId(subtaskId),
          userId,
        },
        { session }
      );
      if (!removedSubtask) {
        throw new NotFoundException("Cannot delete non-existent subtask");
      }

      await this.taskModel.findByIdAndUpdate(
        removedSubtask.taskId,
        {
          $pull: { subtasks: removedSubtask._id },
        },
        { session }
      );

      await this.notificationService.deleteNotifications(subtaskId, session);

      return removedSubtask;
    } else if (status === "assignee") {
      throw new BadRequestException(
        "You are not allowed to remove this subtask"
      );
    }
  }

  private async checkStatusForSubtask(
    userId: Types.ObjectId,
    id: string
  ): Promise<CheckStatusForSubtask> {
    let status: string;
    const foundSubtask = await this.subtaskModel.findOne({
      _id: new Types.ObjectId(id),
      $or: [{ userId: userId }, { assigneeId: userId }],
    });

    if (!foundSubtask) throw new Error("Subtask not found");

    const isOwner = foundSubtask.userId.toString() === userId.toString();
    const isAssignee = foundSubtask.assigneeId.toString() === userId.toString();

    if (isOwner) {
      if (isAssignee) {
        status = "gigachad";
      } else {
        status = "owner";
      }
    } else {
      status = "assignee";
    }

    return { foundSubtask, status };
  }
}
