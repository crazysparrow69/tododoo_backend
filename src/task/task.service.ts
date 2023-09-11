import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common/exceptions';

import { Task } from './task.schema';
import { CreateTaskDto } from './dtos/create-task.dto';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  findOne(id: string): Promise<Task> {
    return this.taskModel.findById(id);
  }

  find() {}

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
