import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategorySchema } from './category.schema';
import { User, UserSchema } from 'src/user/user.schema';
import { Task, TaskSchema } from 'src/task/task.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    AuthModule,
  ],
  providers: [CategoryService, AuthGuard],
  controllers: [CategoryController],
})
export class CategoryModule {}
