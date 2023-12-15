import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { User, UserSchema } from '../user/user.schema';
import { Category, CategorySchema } from './category.schema';
import { Task, TaskSchema } from '../task/task.schema';

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
