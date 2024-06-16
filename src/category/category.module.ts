import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Task, TaskSchema } from "../task/task.schema";
import { User, UserSchema } from "../user/user.schema";
import { CategoryController } from "./category.controller";
import { Category, CategorySchema } from "./category.schema";
import { CategoryService } from "./category.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    AuthModule,
  ],
  providers: [CategoryService, AuthGuard],
  controllers: [CategoryController],
})
export class CategoryModule {}
