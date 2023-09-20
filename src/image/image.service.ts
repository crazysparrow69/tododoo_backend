import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

import { Avatar } from './avatar.schema';
import { User } from 'src/user/user.schema';

interface CreatedAvatarDoc {
  __v: string;
  _id: string;
  image: string;
  userId: User;
}

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Avatar.name) private avatarModel: Model<Avatar>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findOneAvatar(userId: string) {
    let foundImage: Document<Avatar> = await this.avatarModel
      .findOne({ userId })
      .select(['-__v']);

    if (!foundImage) {
      foundImage = await this.avatarModel
        .findOne({ _id: 'dsadsadsadsa' })
        .select(['-__v']);
    }

    return foundImage;
  }

  async createAvatar(userId: string, image: string) {
    const foundAvatar = await this.avatarModel.findOne({ userId });

    if (foundAvatar) {
      await this.avatarModel.deleteOne({ userId });
    }

    const createdAvatar = await this.avatarModel.create({ userId, image });

    await this.userModel.findByIdAndUpdate(userId, {
      avatar: createdAvatar._id,
    });

    const { __v, ...createdAvatarData } =
      createdAvatar.toObject() as CreatedAvatarDoc;

    return createdAvatarData;
  }
}
