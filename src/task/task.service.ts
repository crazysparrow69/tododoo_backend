import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common/exceptions';
import { Types } from 'mongoose';

import { Task } from './task.schema';
import { User } from '../user/user.schema';
import { Category } from '../category/category.schema';
import { CreateTaskDto } from './dtos/create-task.dto';
import { QueryTaskDto } from './dtos/query-task.dto';
import { CreateSubtaskDto } from './dtos/create-subtask.dto';
import { Subtask, SubtaskDocument } from './subtask.schema';

interface QueryParamsTask {
  userId: string;
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

interface QueryParamsSubtask {
  assigneeId: string;
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

interface CreatedTaskDoc {
  __v: string;
  title: string;
  description: string;
  categories: Category[];
  isCompleted: boolean;
  dateOfCompletion: Date;
  links: Array<string>;
  deadline: Date;
  subtasks: Subtask[];
  userId: User;
  createdAt: Date;
  updatedAt: Date;
}

interface CheckStatusForSubtaskInterface {
  foundSubtask: SubtaskDocument;
  status: string;
}

type Stats = {
  date: Date;
  counter: number;
}[];

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Subtask.name) private subtaskModel: Model<Subtask>,
  ) {}

  async findOne(userId: string, id: string): Promise<Task> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ObjectId');

    const foundTask = await this.taskModel
      .findOne({ _id: id, userId })
      .select(['-__v']);
    if (!foundTask) throw new NotFoundException('Task not found');

    return foundTask;
  }

  async findTasksByQuery(
    userId: string,
    query: QueryTaskDto,
  ): Promise<
    | {
        tasks: Task[];
        currentPage: number;
        totalPages: number;
      }
    | Task[]
  > {
    const {
      page = 1,
      limit = 10,
      isCompleted = null,
      categories = null,
      deadline = null,
    } = query;

    let queryParams: QueryParamsTask = {
      userId: userId,
    };

    if (isCompleted !== null) {
      queryParams.isCompleted = isCompleted;
    }

    if (categories) {
      queryParams.categories = { $all: categories };
    }

    if (deadline) {
      const date = new Date();
      const year = date.getFullYear();
      const month =
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1;
      const day = date.getDate();
      const todayMidnight = new Date(`${year}-${month}-${day}`);

      if (deadline === 'day') {
        queryParams.deadline = todayMidnight;
      } else if (deadline == 'week') {
        const today = new Date(`${year}-${month}-${day}`);
        queryParams.deadline = {
          $gte: todayMidnight,
          $lte: new Date(today.setDate(today.getDate() + 7)),
        };
      } else if (deadline === 'month') {
        const today = new Date(`${year}-${month}-${day}`);
        queryParams.deadline = {
          $gte: todayMidnight,
          $lte: new Date(today.setMonth(today.getMonth() + 1)),
        };
      } else if (deadline === 'year') {
        queryParams.deadline = {
          $gte: todayMidnight,
          $lte: new Date(`${year + 1}-${month}-${day}`),
        };
      } else if (deadline === 'outdated') {
        queryParams.deadline = {
          $lt: todayMidnight,
        };
      }
    }

    let foundTasks: Task[];
    const populateParams = [
      {
        path: 'categories',
        select: '-__v',
      },
      {
        path: 'subtasks',
        select: 'title userId isCompleted deadline rejected',
        populate: {
          path: 'userId',
          select: 'username avatar',
        },
      },
    ];

    if (query.page || query.limit) {
      const count = await this.taskModel.countDocuments(queryParams);

      const totalPages = Math.ceil(count / limit);

      foundTasks = await this.taskModel
        .find(queryParams)
        .populate(populateParams)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select(['-__v'])
        .exec();

      return { tasks: foundTasks, currentPage: page, totalPages };
    } else {
      foundTasks = await this.taskModel
        .find(queryParams)
        .populate(populateParams)
        .select('-__v');

      return foundTasks;
    }
  }

  async createTask(
    userId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    const createdTask = await this.taskModel.create({
      userId,
      dateOfCompletion: createTaskDto.isCompleted ? new Date() : null,
      ...createTaskDto,
    });

    await this.userModel.findByIdAndUpdate(userId, {
      $push: { tasks: createdTask._id },
    });

    await createdTask.populate('categories');

    const { __v, ...createdTaskData } =
      createdTask.toObject() as CreatedTaskDoc;

    return createdTaskData;
  }

  async updateTask(
    userId: string,
    id: string,
    attrs: Partial<Task>,
  ): Promise<Task> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ObjectId');

    if (attrs.categories) {
      const count = await this.categoryModel.countDocuments({
        _id: { $in: attrs.categories },
        userId,
      });
      if (count !== attrs.categories.length)
        throw new BadRequestException(
          "Some categories listed in categories array don't exist or belong to user",
        );
    }

    if (attrs.isCompleted === true) {
      attrs.dateOfCompletion = new Date();
    } else if (attrs.isCompleted === false) {
      attrs.dateOfCompletion = null;
    }

    const updatedTask = await this.taskModel
      .findOneAndUpdate({ _id: id, userId }, attrs, { new: true })
      .populate('categories')
      .select(['-__v']);
    if (!updatedTask) throw new NotFoundException('Task not found');

    return updatedTask;
  }

  async removeTask(userId: string, id: string): Promise<Task> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ObjectId');

    const deletedTask = await this.taskModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (deletedTask) {
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { tasks: deletedTask._id },
      });
      await this.subtaskModel.deleteMany({
        _id: { $in: deletedTask.subtasks },
      });
    }

    return;
  }

  async findSubtasksByQuery(
    assigneeId: string,
    query: QueryTaskDto,
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

    let queryParams: QueryParamsSubtask = {
      assigneeId,
    };

    if (isCompleted !== null) {
      queryParams.isCompleted = isCompleted;
    }

    if (categories) {
      queryParams.categories = { $all: categories };
    }

    if (deadline) {
      const date = new Date();
      const year = date.getFullYear();
      const month =
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1;
      const day = date.getDate();
      const todayMidnight = new Date(`${year}-${month}-${day}`);

      if (deadline === 'day') {
        queryParams.deadline = todayMidnight;
      } else if (deadline == 'week') {
        const today = new Date(`${year}-${month}-${day}`);
        queryParams.deadline = {
          $gte: todayMidnight,
          $lte: new Date(today.setDate(today.getDate() + 7)),
        };
      } else if (deadline === 'month') {
        const today = new Date(`${year}-${month}-${day}`);
        queryParams.deadline = {
          $gte: todayMidnight,
          $lte: new Date(today.setMonth(today.getMonth() + 1)),
        };
      } else if (deadline === 'year') {
        queryParams.deadline = {
          $gte: todayMidnight,
          $lte: new Date(`${year + 1}-${month}-${day}`),
        };
      } else if (deadline === 'outdated') {
        queryParams.deadline = {
          $lt: todayMidnight,
        };
      }
    }

    let foundSubtasks: Subtask[];
    const populateParams = [
      {
        path: 'categories',
        select: '-__v',
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
        .select(['-__v'])
        .exec();

      return { subtasks: foundSubtasks, currentPage: page, totalPages };
    } else {
      foundSubtasks = await this.subtaskModel
        .find(queryParams)
        .populate(populateParams)
        .select('-__v');

      return foundSubtasks;
    }
  }

  async addSubtask(
    userId: string,
    taskId: string,
    createSubtaskDto: CreateSubtaskDto,
  ): Promise<void> {
    const createdSubtask = await this.subtaskModel.create({
      userId,
      taskId,
      dateOfCompletion: createSubtaskDto.isCompleted ? new Date() : null,
      ...createSubtaskDto,
    });

    await this.taskModel.findByIdAndUpdate(taskId, {
      $push: { subtasks: createdSubtask._id },
    });

    return;
  }

  async updateSubtask(
    userId: string,
    id: string,
    attrs: Partial<Subtask>,
  ): Promise<Subtask> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId');
    }

    try {
      const { foundSubtask, status } = await this.checkStatusForSubtask(
        userId,
        id,
      );

      if ('isCompleted' in attrs) {
        foundSubtask.isCompleted = attrs.isCompleted;
        foundSubtask.dateOfCompletion = attrs.isCompleted ? new Date() : null;
      }

      foundSubtask.links = attrs.links ?? foundSubtask.links;

      const { categories = null, ...restData } = attrs;

      if (status === 'assignee') {
        foundSubtask.rejected = attrs.rejected ?? foundSubtask.rejected;
      }

      if ((status === 'assignee' || status === 'gigachad') && categories) {
        const count = await this.categoryModel.countDocuments({
          _id: { $in: attrs.categories },
          userId,
        });

        if (count !== attrs.categories.length) {
          throw new BadRequestException(
            "Some categories listed in categories array don't exist or belong to the user",
          );
        }

        foundSubtask.categories = attrs.categories;
      }

      if (status === 'owner' || status === 'gigachad') {
        Object.assign(foundSubtask, restData);
      }

      await foundSubtask.save();

      return foundSubtask;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async removeSubtask(userId: string, subtaskId: string): Promise<void> {
    const removedSubtask = await this.subtaskModel.findOneAndDelete({
      _id: subtaskId,
      userId,
    });

    if (removedSubtask) {
      await this.taskModel.findByIdAndUpdate(removedSubtask.taskId, {
        $pull: { subtasks: removedSubtask._id },
      });
    }

    return;
  }

  async getStats(userId: string): Promise<Stats> {
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

  private async checkStatusForSubtask(
    userId: string,
    id: string,
  ): Promise<CheckStatusForSubtaskInterface> {
    let status: string;
    const foundSubtask = await this.subtaskModel.findOne({
      _id: id,
      $or: [{ userId: userId }, { assigneeId: userId }],
    });

    if (!foundSubtask) throw new Error('Subtask not found');

    const isOwner = foundSubtask.userId.toString() === userId.toString();
    const isAssignee = foundSubtask.assigneeId.toString() === userId.toString();

    if (isOwner) {
      if (isAssignee) {
        status = 'gigachad';
      } else {
        status = 'owner';
      }
    } else {
      status = 'assignee';
    }

    return { foundSubtask, status };
  }
}
