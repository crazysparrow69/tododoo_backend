import { Injectable } from "@nestjs/common";
import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common/exceptions";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";

import { CreateTaskDto, QueryTaskDto, TaskResponseDto } from "./dtos";
import { Subtask, Task } from "./schemas";
import { TaskMapperService } from "./task-mapper.service";
import { UserTasksStats, QueryParamsTask } from "./types";
import { Category } from "../category/category.schema";
import { getDeadlineFilter } from "../common";
import { transaction } from "src/common/transaction";
import { getTaskPopulate } from "./task.populate";
import { NotificationService } from "src/notification/notification.service";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Subtask.name) private subtaskModel: Model<Subtask>,
    private readonly taskMapperService: TaskMapperService,
    private readonly notificationService: NotificationService,
    @InjectConnection() private readonly connection: mongoose.Connection
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
      queryParams.deadline = getDeadlineFilter(deadline);
    }

    const projection = {
      _id: 1,
      title: 1,
      description: 1,
      isCompleted: 1,
      categories: 1,
      links: 1,
      subtasks: 1,
      dateOfCompletion: 1,
      deadline: 1,
    };

    if (query.page || query.limit) {
      const count = await this.taskModel.countDocuments(queryParams);
      const totalPages = Math.ceil(count / limit);

      const foundTasks = await this.taskModel
        .find(queryParams, projection)
        .lean()
        .populate(getTaskPopulate())
        .limit(limit)
        .skip((page - 1) * limit);

      return {
        tasks: this.taskMapperService.toTasks(foundTasks),
        currentPage: page,
        totalPages,
      };
    } else {
      const foundTasks = await this.taskModel
        .find(queryParams, projection)
        .lean()
        .populate(getTaskPopulate());

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
    await createdTask.populate(getTaskPopulate());

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
      .populate(getTaskPopulate())
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

    const deletedTask = await transaction<Task>(
      this.connection,
      async (session) => {
        const task = await this.taskModel
          .findOneAndDelete(
            {
              _id: id,
              userId,
            },
            { session }
          )
          .lean();
        if (!task) {
          throw new NotFoundException("Cannot delete non-existent task");
        }

        await this.subtaskModel.deleteMany(
          {
            _id: { $in: task.subtasks },
          },
          { session }
        );

        for (const subtaskId of task.subtasks) {
          await this.notificationService.deleteNotifications(
            subtaskId.toString(),
            session
          );
        }

        return task;
      }
    );

    return deletedTask;
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
}
