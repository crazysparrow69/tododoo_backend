import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { Task, TaskSchema } from './task.schema';
import { User, UserSchema } from '../user/user.schema';
import { Category, CategorySchema } from '../category/category.schema';
import { Subtask, SubtaskSchema } from './subtask.schema';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Subtask.name, schema: SubtaskSchema },
    ]),
    AuthModule,
  ],
  providers: [TaskService, AuthGuard],
  controllers: [TaskController],
})
export class TaskModule {}
