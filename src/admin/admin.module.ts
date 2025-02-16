import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SessionSchema, Session } from "../auth/session.schema";
import { UserModule } from "../user/user.module";
import { User, UserSchema } from "../user/user.schema";

import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AuthModule } from "../auth/auth.module";
import { ImageService } from "../image/image.service";
import { UserAvatar, UserAvatarSchema } from "../image/schemas/user-avatar.schema";
import { ProfileEffect, ProfileEffectSchema } from "../image/schemas/profile-effect.schema";
import { UserAvatarMapperService } from "../image/mappers/user-avatar-mapper";
import { ProfileEffectMapperService } from "../image/mappers/profile-effect-mapper";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserAvatar.name, schema: UserAvatarSchema },
      { name: ProfileEffect.name, schema: ProfileEffectSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    forwardRef(() => AuthModule),
    UserModule,
  ],
  providers: [AdminService, ImageService, UserAvatarMapperService, ProfileEffectMapperService],
  controllers: [AdminController],
})
export class AdminModule {}
