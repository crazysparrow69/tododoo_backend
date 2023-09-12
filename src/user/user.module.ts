import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Task, TaskSchema } from 'src/task/task.schema';
import { Category, CategorySchema } from 'src/category/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [UserService, AuthService],
  controllers: [UserController],
})
export class UserModule {}
