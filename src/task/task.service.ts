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
import { CreateTaskDto } from './dtos/create-task.dto';
import { QueryTaskDto } from './dtos/query-task.dto';

interface queryParams {
  userId: string;
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findOne(userId: string, id: string): Promise<Task> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ObjectId');

    const foundTask = await this.taskModel.findOne({ _id: id, userId });
    if (!foundTask) throw new NotFoundException('Task not found');

    return foundTask;
  }

  find(userId: string, query: QueryTaskDto): Promise<Task[]> {
    let queryParams: queryParams = {
      userId: userId,
    };
    const { isCompleted = null, categories = null, deadline = null } = query;

    if (isCompleted) {
      queryParams.isCompleted = JSON.parse(isCompleted);
    }
    if (categories) {
      queryParams.categories = { $all: JSON.parse(categories) };
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

    return this.taskModel.find(queryParams).populate('categories');
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

    return createdTask;
  }

  async update(
    userId: string,
    id: string,
    attrs: Partial<Task>,
  ): Promise<Task> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ObjectId');

    if (attrs.isCompleted === true) {
      attrs.dateOfCompletion = new Date();
    } else if (attrs.isCompleted === false) {
      attrs.dateOfCompletion = null;
    }

    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: id, userId },
      attrs,
      { new: true },
    );
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
}
