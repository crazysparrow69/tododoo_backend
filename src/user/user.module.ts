import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserController } from "./user.controller";
import { User, UserSchema } from "./user.schema";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Category, CategorySchema } from "../category/category.schema";
import { ImageService } from "../image/image.service";
import { Task, TaskSchema } from "../task/task.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [UserService, ImageService, AuthGuard],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
