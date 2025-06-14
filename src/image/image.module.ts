import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";
import { AuthModule } from "../auth/auth.module";
import { Session, SessionSchema } from "../auth/session.schema";
import { User, UserSchema } from "../user/user.schema";
import {
  ProfileEffect,
  ProfileEffectSchema,
  UserAvatar,
  UserAvatarEffect,
  UserAvatarEffectSchema,
  UserAvatarSchema,
} from "./schemas";
import {
  ProfileEffectMapperService,
  UserAvatarEffectMapperService,
  UserAvatarMapperService,
} from "./mappers";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserAvatar.name, schema: UserAvatarSchema },
      { name: ProfileEffect.name, schema: ProfileEffectSchema },
      { name: UserAvatarEffect.name, schema: UserAvatarEffectSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    AuthModule,
  ],
  providers: [
    ImageService,
    UserAvatarMapperService,
    ProfileEffectMapperService,
    UserAvatarEffectMapperService,
  ],
  controllers: [ImageController],
})
export class ImageModule {}
