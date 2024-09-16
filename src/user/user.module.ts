import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Session, SessionSchema } from "src/auth/session.schema";
import { Task, TaskSchema } from "src/task/schemas";

import { UserMapperService } from "./user-mapper.service";
import { UserController } from "./user.controller";
import { User, UserSchema } from "./user.schema";
import { UserService } from "./user.service";
import { Category, CategorySchema } from "../category/category.schema";
import { ImageService } from "../image/image.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, UserMapperService, ImageService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
