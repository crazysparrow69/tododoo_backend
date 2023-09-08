import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { BadRequestException } from '@nestjs/common/exceptions';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

import { User } from './user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findOne(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  find(query: QueryUserDto): Promise<User[]> {
    return this.userModel.find(query);
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
    const result = salt + '.' + hash.toString('hex');

    const createdUser = new this.userModel({
      ...createUserDto,
      password: result,
    });
    return createdUser.save();
  }

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const foundUser = await this.userModel.findById(id);
    Object.assign(foundUser, attrs);
    return foundUser.save();
  }

  remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id);
  }
}
