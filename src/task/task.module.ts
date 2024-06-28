import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoryModule } from "src/category/category.module";

import { Subtask, SubtaskSchema, Task, TaskSchema } from "./schemas";
import { TaskMapperService } from "./task-mapper.service";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { AuthModule } from "../auth/auth.module";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Category, CategorySchema } from "../category/category.schema";
import { NotificationModule } from "../notification/notification.module";
import { User, UserSchema } from "../user/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Subtask.name, schema: SubtaskSchema },
    ]),
    AuthModule,
    CategoryModule,
    forwardRef(() => NotificationModule),
  ],
  providers: [TaskService, TaskMapperService, AuthGuard],
  exports: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
