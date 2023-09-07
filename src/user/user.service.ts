import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findOne(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  find(query: QueryUserDto): any {
    return this.userModel.find(query);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const foundUser = await this.userModel.findById(id);
    Object.assign(foundUser, attrs);
    return foundUser.save();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
