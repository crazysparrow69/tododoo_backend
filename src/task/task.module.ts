import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { Task, TaskSchema } from './task.schema';
import { User, UserSchema } from 'src/user/user.schema';
import { Category, CategorySchema } from 'src/category/category.schema';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    AuthModule,
  ],
  providers: [TaskService, AuthGuard],
  controllers: [TaskController],
})
export class TaskModule {}
