import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthService } from "./auth.service";
import { UserController } from "./user.controller";
import { User, UserSchema } from "./user.schema";
import { UserService } from "./user.service";
import { AuthModule } from "../auth/auth.module";
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
    AuthModule,
  ],
  providers: [UserService, AuthService, ImageService, AuthGuard],
  controllers: [UserController],
})
export class UserModule {}
