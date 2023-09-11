import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common/exceptions';

import { Task } from './task.schema';
import { CreateTaskDto } from './dtos/create-task.dto';
import { QueryTaskDto } from './dtos/query-task.dto';

interface queryParams {
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  findOne(id: string): Promise<Task> {
    return this.taskModel.findById(id);
  }

  find(query: QueryTaskDto): Promise<Task[]> {
    let queryParams: queryParams = {};
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

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskModel.create({
      ...createTaskDto,
      userId: '64fb1939b44653227cee1813',
    });
  }

  async update(id: string, attrs: Partial<Task>): Promise<Task> {
    if (attrs.isCompleted === true) {
      attrs.dateOfCompletion = new Date();
    } else if (attrs.isCompleted === false) {
      attrs.dateOfCompletion = null;
    }

    const updatedTask = await this.taskModel.findByIdAndUpdate(id, attrs);

    if (!updatedTask) {
      throw new NotFoundException('Task not found');
    }

    return updatedTask;
  }

  remove(id: string): Promise<Task> {
    return this.taskModel.findByIdAndDelete(id);
  }
}
