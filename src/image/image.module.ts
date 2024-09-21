import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";
import { AuthModule } from "../auth/auth.module";
import { Session, SessionSchema } from "../auth/session.schema";
import { User, UserSchema } from "../user/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    AuthModule,
  ],
  providers: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}
