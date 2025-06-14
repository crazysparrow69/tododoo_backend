import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CategoryMapperService } from "./category-mapper.service";
import { CategoryController } from "./category.controller";
import { Category, CategorySchema } from "./category.schema";
import { CategoryService } from "./category.service";
import { AuthModule } from "../auth/auth.module";
import { Session, SessionSchema } from "../auth/session.schema";
import { Task, TaskSchema } from "../task/schemas";
import { User, UserSchema } from "../user/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Task.name, schema: TaskSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    AuthModule,
  ],
  providers: [CategoryService, CategoryMapperService],
  exports: [CategoryMapperService],
  controllers: [CategoryController],
})
export class CategoryModule {}
