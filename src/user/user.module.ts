import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserMapperService } from "./user-mapper.service";
import { UserController } from "./user.controller";
import { User, UserSchema } from "./user.schema";
import { UserService } from "./user.service";
import { AuthModule } from "../auth/auth.module";
import { Session, SessionSchema } from "../auth/session.schema";
import { Category, CategorySchema } from "../category/category.schema";
import { ImageService } from "../image/image.service";
import { Task, TaskSchema } from "../task/schemas";
import {
  UserAvatar,
  UserAvatarSchema,
} from "../image/schemas/user-avatar.schema";
import { UserAvatarMapperService } from "../image/mappers/user-avatar-mapper";
import {
  ProfileEffect,
  ProfileEffectSchema,
} from "../image/schemas/profile-effect.schema";
import { ProfileEffectMapperService } from "../image/mappers/profile-effect-mapper";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserAvatar.name, schema: UserAvatarSchema },
      { name: ProfileEffect.name, schema: ProfileEffectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  providers: [
    UserService,
    UserMapperService,
    ImageService,
    UserAvatarMapperService,
    ProfileEffectMapperService,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
