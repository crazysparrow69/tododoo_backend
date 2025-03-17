import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Subtask, SubtaskSchema, Task, TaskSchema } from "./schemas";
import { SubtaskMapperService } from "./subtask-mapper.service";
import { SubtaskController } from "./subtask.controller";
import { SubtaskService } from "./subtask.service";
import { TaskMapperService } from "./task-mapper.service";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { AuthModule } from "../auth/auth.module";
import { Session, SessionSchema } from "../auth/session.schema";
import { CategoryModule } from "../category/category.module";
import { Category, CategorySchema } from "../category/category.schema";
import { NotificationModule } from "../notification/notification.module";
import { User, UserSchema } from "../user/user.schema";
import { UserAvatarEffectMapperService } from "../image/mappers";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Subtask.name, schema: SubtaskSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    AuthModule,
    CategoryModule,
    forwardRef(() => NotificationModule),
  ],
  providers: [
    TaskService,
    TaskMapperService,
    SubtaskService,
    SubtaskMapperService,
    UserAvatarEffectMapperService,
  ],
  exports: [TaskService, SubtaskService],
  controllers: [TaskController, SubtaskController],
})
export class TaskModule {}
