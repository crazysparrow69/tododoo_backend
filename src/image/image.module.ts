import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { User, UserSchema } from "../user/user.schema";
import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}
