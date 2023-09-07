import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.schema';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findOne(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  find(email: string): Promise<[User]> {
    return;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  update() {}

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
