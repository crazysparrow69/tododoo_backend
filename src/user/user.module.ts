import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from './auth.service';
import { ImageService } from '../image/image.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Task, TaskSchema } from '../task/task.schema';
import { Category, CategorySchema } from '../category/category.schema';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/guards/auth.guard';

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
