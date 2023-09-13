import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import mongoose from 'mongoose';

import { User } from './user.schema';
import { Task } from 'src/task/task.schema';
import { Category } from 'src/category/category.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  findOne(id: string): Promise<User> {
    return this.userModel
      .findById(id)
      .select(['-categories', '-tasks', '-password', '-__v']);
  }

  find(query: QueryUserDto): Promise<User[]> {
    return this.userModel
      .find(query)
      .select(['-categories', '-tasks', '-__v']);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const [foundUser] = await this.find({
      email: createUserDto.email,
    } as QueryUserDto);
    if (foundUser) {
      throw new BadRequestException('Email already in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(createUserDto.password, salt, 32)) as Buffer;
    const hashedPassword = salt + '.' + hash.toString('hex');

    return this.userModel.create({
      ...createUserDto,
      _id: new mongoose.Types.ObjectId(),
      password: hashedPassword,
    });
  }

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, attrs, {
      new: true,
    });

    if (!updatedUser) throw new NotFoundException('User not found');

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (deletedUser) {
      await this.taskModel.deleteMany({ userId: deletedUser._id });
      await this.categoryModel.deleteMany({ userId: deletedUser._id });
    }

    return;
  }
}
