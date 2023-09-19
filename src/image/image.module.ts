import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { Avatar, AvatarSchema } from './avatar.schema';
import { User, UserSchema } from 'src/user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Avatar.name, schema: AvatarSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}
