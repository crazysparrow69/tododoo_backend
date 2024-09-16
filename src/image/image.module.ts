import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Session, SessionSchema } from "src/auth/session.schema";

import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";
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
