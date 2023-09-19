import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Avatar } from './avatar.schema';
import { User } from 'src/user/user.schema';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Avatar.name) private avatarModel: Model<Avatar>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createAvatar(userId: string, image: string) {
    const foundAvatar = await this.avatarModel.findOne({ userId });

    if (foundAvatar) {
      await this.avatarModel.deleteOne({ userId });
    }

    const createdAvatar = await this.avatarModel.create({ userId, image });

    await this.userModel.findByIdAndUpdate(userId, {
      avatar: createdAvatar._id,
    });

    return createdAvatar;
  }

  async findOneAvatar(userId: string) {
    let foundImage = await this.avatarModel.findOne({ userId });

    if (!foundImage) {
      foundImage = await this.avatarModel.findOne({ _id: 'dsadsadsadsa' });
    }

    return foundImage;
  }
}
