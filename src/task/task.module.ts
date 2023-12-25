import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { NotificationModule } from '../notification/notification.module';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { User, UserSchema } from '../user/user.schema';
import { Category, CategorySchema } from '../category/category.schema';
import { Task, TaskSchema } from './task.schema';
import { Subtask, SubtaskSchema } from './subtask.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Subtask.name, schema: SubtaskSchema },
    ]),
    AuthModule,
    forwardRef(() => NotificationModule),
  ],
  providers: [TaskService, AuthGuard],
  exports: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
