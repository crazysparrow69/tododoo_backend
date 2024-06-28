import { Injectable } from "@nestjs/common";
import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import {
  CreateSubtaskDto,
  CreateTaskDto,
  QueryTaskDto,
  TaskResponseDto,
} from "./dtos";
import { Subtask, Task } from "./schemas";
import { TaskMapperService } from "./task-mapper.service";
import {
  CheckStatusForSubtask,
  QueryParamsSubtask,
  QueryParamsTask,
} from "./task.interface";
import { UserTasksStats } from "./types";
import { Category } from "../category/category.schema";
import { User } from "../user/user.schema";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Subtask.name) private subtaskModel: Model<Subtask>,
    private readonly taskMapperService: TaskMapperService
  ) {}

  async findOne(userId: string, id: string): Promise<TaskResponseDto> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid ObjectId");

    const foundTask = await this.taskModel
      .findOne(
        { _id: id, userId },
        {
          _id: 1,
          title: 1,
          description: 1,
          isCompleted: 1,
          categories: 1,
          links: 1,
          subtasks: 1,
          dateOfCompletion: 1,
          deadline: 1,
        }
      )
      .lean();
    if (!foundTask) throw new NotFoundException("Task not found");

    return this.taskMapperService.toTaskResponse(foundTask);
  }

  async findByQuery(
    userId: string,
    query: QueryTaskDto
  ): Promise<
    | {
        tasks: TaskResponseDto[];
        currentPage: number;
        totalPages: number;
      }
    | TaskResponseDto[]
  > {
    const {
      page = 1,
      limit = 10,
      isCompleted = null,
      categories = null,
      deadline = null,
    } = query;

    const queryParams: QueryParamsTask = {
      userId: userId,
    };

    if (isCompleted !== null) {
      queryParams.isCompleted = isCompleted;
    }

    if (categories) {
      queryParams.categories = { $all: categories };
    }

    if (deadline && deadline !== "all") {
      queryParams.deadline = this.getDeadlineFilter(deadline);
    }

    const populateParams = [
      {
        path: "categories",
        select: "-__v",
      },
      {
        path: "subtasks",
        select: "-_v -createdAt -updatedAt -categories -links",
        populate: {
          path: "assigneeId",
          select: "username avatar",
        },
      },
    ];

    let foundTasks: Task[];

    if (query.page || query.limit) {
      const count = await this.taskModel.countDocuments(queryParams);

      const totalPages = Math.ceil(count / limit);
      const foundTasks = await this.taskModel
        .find(queryParams, {
          _id: 1,
          title: 1,
          description: 1,
          isCompleted: 1,
          categories: 1,
          links: 1,
          subtasks: 1,
          dateOfCompletion: 1,
          deadline: 1,
        })
        .lean()
        .populate(populateParams)
        .limit(limit)
        .skip((page - 1) * limit);

      return {
        tasks: this.taskMapperService.toTasks(foundTasks),
        currentPage: page,
        totalPages,
      };
    } else {
      foundTasks = await this.taskModel
        .find(queryParams, {
          _id: 1,
          title: 1,
          description: 1,
          isCompleted: 1,
          categories: 1,
          links: 1,
          subtasks: 1,
          dateOfCompletion: 1,
          deadline: 1,
        })
        .lean()
        .populate(populateParams);

      return this.taskMapperService.toTasks(foundTasks);
    }
  }

  async create(
    userId: string,
    createTaskDto: CreateTaskDto
  ): Promise<TaskResponseDto> {
    const createdTask = await this.taskModel.create({
      userId,
      ...createTaskDto,
    });

    await this.userModel.findByIdAndUpdate(userId, {
      $push: { tasks: createdTask._id },
    });

    await createdTask.populate("categories");

    return this.taskMapperService.toTaskResponse(createdTask);
  }

  async update(
    userId: string,
    id: string,
    attrs: Partial<Task>
  ): Promise<TaskResponseDto> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid ObjectId");

    if (attrs.categories) {
      const count = await this.categoryModel.countDocuments({
        _id: { $in: attrs.categories },
        userId,
      });
      if (count !== attrs.categories.length)
        throw new BadRequestException(
          "Some categories listed in categories array don't exist or belong to user"
        );
    }

    if (attrs.isCompleted === true) {
      attrs.dateOfCompletion = new Date();
    } else if (attrs.isCompleted === false) {
      attrs.dateOfCompletion = null;
    }

    const updatedTask = await this.taskModel
      .findOneAndUpdate({ _id: id, userId }, attrs, { new: true })
      .lean()
      .populate("categories")
      .select([
        "_id",
        "title",
        "description",
        "isCompleted",
        "categories",
        "links",
        "subtasks",
        "dateOfCompletion",
        "deadline",
      ]);
    if (!updatedTask) throw new NotFoundException("Task not found");

    return this.taskMapperService.toTaskResponse(updatedTask);
  }

  async remove(userId: string, id: string): Promise<Task> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid ObjectId");

    const deletedTask = await this.taskModel
      .findOneAndDelete({
        _id: id,
        userId,
      })
      .lean();

    if (deletedTask) {
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { tasks: deletedTask._id },
      });
      await this.subtaskModel.deleteMany({
        _id: { $in: deletedTask.subtasks },
      });
    }

    return deletedTask;
  }

  async findSubtasksByQuery(
    assigneeId: string,
    query: QueryTaskDto
  ): Promise<
    | {
        subtasks: Subtask[];
        currentPage: number;
        totalPages: number;
      }
    | Subtask[]
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
      rejected: false,
      isConfirmed: true,
    };

    if (isCompleted !== null) {
      queryParams.isCompleted = isCompleted;
    }

    if (categories) {
      queryParams.categories = { $all: categories };
    }

    if (deadline && deadline !== "all") {
      queryParams.deadline = this.getDeadlineFilter(deadline);
    }

    let foundSubtasks: Subtask[];
    const populateParams = [
      {
        path: "categories",
        select: "-__v",
      },
      {
        path: "userId",
        select: "username avatar",
      },
    ];

    if (query.page || query.limit) {
      const count = await this.subtaskModel.countDocuments(queryParams);

      const totalPages = Math.ceil(count / limit);

      foundSubtasks = await this.subtaskModel
        .find(queryParams)
        .populate(populateParams)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select(["-__v"])
        .exec();

      return { subtasks: foundSubtasks, currentPage: page, totalPages };
    } else {
      foundSubtasks = await this.subtaskModel
        .find(queryParams)
        .populate(populateParams)
        .select("-__v");

      return foundSubtasks;
    }
  }

  async addSubtask(
    userId: string,
    taskId: string,
    createSubtaskDto: CreateSubtaskDto
  ): Promise<Subtask> {
    const createdSubtask = await this.subtaskModel.create({
      _id: new Types.ObjectId(),
      userId,
      taskId,
      dateOfCompletion: createSubtaskDto.isCompleted ? new Date() : null,
      isConfirmed:
        userId.toString() === createSubtaskDto.assigneeId.toString()
          ? true
          : false,
      ...createSubtaskDto,
    });

    await this.taskModel.findByIdAndUpdate(taskId, {
      $push: { subtasks: createdSubtask._id },
    });

    return createdSubtask;
  }

  async updateSubtask(
    userId: Types.ObjectId,
    id: string,
    attrs: Partial<Subtask>
  ): Promise<Subtask> {
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
        foundSubtask.isCompleted = attrs.isCompleted;
        foundSubtask.dateOfCompletion = attrs.isCompleted ? new Date() : null;
      }

      foundSubtask.links = attrs.links ?? foundSubtask.links;

      const { categories = null, ...restData } = attrs;

      if (status === "assignee") {
        foundSubtask.rejected = attrs.rejected ?? foundSubtask.rejected;
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

      return foundSubtask;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async updateSubtaskIsConf(
    userId: Types.ObjectId,
    subtaskId: string,
    value: boolean
  ): Promise<void> {
    const foundSubtask = await this.subtaskModel.findById(
      new Types.ObjectId(subtaskId)
    );
    if (foundSubtask) {
      const assigneeId = foundSubtask.assigneeId.toString();
      if (userId.toString() === assigneeId) {
        foundSubtask.isConfirmed = value;
        if (value === false) foundSubtask.rejected = true;
        await foundSubtask.save();
      }
    }
    return;
  }

  async removeSubtask(
    userId: Types.ObjectId,
    subtaskId: string
  ): Promise<Subtask> {
    const { status } = await this.checkStatusForSubtask(userId, subtaskId);

    if (status === "gigachad" || status === "owner") {
      const removedSubtask = await this.subtaskModel.findOneAndDelete({
        _id: new Types.ObjectId(subtaskId),
        userId,
      });

      if (removedSubtask) {
        await this.taskModel.findByIdAndUpdate(removedSubtask.taskId, {
          $pull: { subtasks: removedSubtask._id },
        });
      }

      return removedSubtask;
    } else if (status === "assignee") {
      throw new BadRequestException(
        "You are not allowed to remove this subtask"
      );
    }
  }

  async getStats(userId: string): Promise<UserTasksStats[]> {
    const date = new Date();
    const year = date.getFullYear();
    const month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day = date.getDate();
    const tomorrowMidnight = new Date(`${year}-${month}-${day + 1}`);

    const today = new Date(`${year}-${month}-${day}`);
    const foundTasks = await this.taskModel.find({
      userId: userId,
      dateOfCompletion: {
        $lte: tomorrowMidnight,
        $gte: new Date(today.setDate(today.getDate() - 10)),
      },
    });

    const stats = [];

    for (let i = 0; i < 10; i++) {
      const now = new Date(`${year}-${month}-${day}`);
      const now2 = new Date(`${year}-${month}-${day}`);
      const now3 = new Date(`${year}-${month}-${day}`);

      const dayStats = {
        date: new Date(now.setDate(now.getDate() - i)),
        counter: 0,
      };

      const dayBefore = new Date(now2.setDate(now2.getDate() - i));
      const dayAfter = new Date(now3.setDate(now3.getDate() - i + 1));

      foundTasks.forEach((task) => {
        if (
          task.dateOfCompletion >= dayBefore &&
          task.dateOfCompletion < dayAfter
        ) {
          dayStats.counter++;
        }
      });

      stats.push(dayStats);
    }

    stats.reverse();

    return stats;
  }

  private getDeadlineFilter(deadline: string = "all"): object | null {
    const date = new Date();
    const year = date.getFullYear();
    const month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day = date.getDate();
    const todayMidnight = new Date(`${year}-${month}-${day}`);

    switch (deadline) {
      case "day":
        return todayMidnight;
      case "week":
        return {
          $gte: todayMidnight,
          $lte: new Date(date.setDate(date.getDate() + 7)),
        };
      case "month":
        return {
          $gte: todayMidnight,
          $lte: new Date(date.setMonth(date.getMonth() + 1)),
        };
      case "year":
        return {
          $gte: todayMidnight,
          $lte: new Date(`${year + 1}-${month}-${day}`),
        };
      case "outdated":
        return { $lt: todayMidnight };
      case "nodeadline":
        return null;
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
