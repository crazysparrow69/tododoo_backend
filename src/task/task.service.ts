import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common/exceptions';
import { Types } from 'mongoose';

import { Task } from './task.schema';
import { User } from 'src/user/user.schema';
import { Category } from 'src/category/category.schema';
import { CreateTaskDto } from './dtos/create-task.dto';
import { QueryTaskDto } from './dtos/query-task.dto';

interface queryParams {
  userId: string;
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

interface createdTaskDoc {
  __v: string;
  title: string;
  description: string;
  categories: Category[];
  isCompleted: boolean;
  dateOfCompletion: Date;
  links: Array<string>;
  deadline: Date;
  userId: User;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
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

  async find(
    userId: string,
    query: QueryTaskDto,
  ): Promise<{ tasks: Task[]; currentPage: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      isCompleted = null,
      categories = null,
      deadline = null,
    } = query;

    let queryParams: queryParams = {
      userId: userId,
    };

    if (isCompleted) {
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

    const count = await this.taskModel.countDocuments(queryParams);

    const totalPages = Math.ceil(count / limit);

    const foundTasks = await this.taskModel
      .find(queryParams)
      .populate('categories')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select(['-__v'])
      .exec();

    return { tasks: foundTasks, currentPage: page, totalPages };
  }

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
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
      createdTask.toObject() as createdTaskDoc;

    return createdTaskData;
  }

  async update(
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

  async remove(userId: string, id: string): Promise<Task> {
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
    }

    return;
  }

  async getStats(userId: string) {
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
