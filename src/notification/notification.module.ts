import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConfirmationModule } from "./../confirmation/confirmation.module";
import { NotificationMapperService } from "./notification-mapper.service";
import { NotificationController } from "./notification.controller";
import { NotificationGateway } from "./notification.gateway";
import { Notification, NotificationSchema } from "./notification.schema";
import { NotificationService } from "./notification.service";
import { AuthModule } from "../auth/auth.module";
import { Session, SessionSchema } from "../auth/session.schema";
import { TaskModule } from "../task/task.module";
import { User, UserSchema } from "../user/user.schema";
import { UserMapperService } from "src/user/user-mapper.service";
import {
  ProfileEffectMapperService,
  UserAvatarEffectMapperService,
} from "src/image/mappers";
import {
  SubtaskConfirmation,
  SubtaskConfirmationSchema,
} from "src/confirmation/subtask-confirmation.schema";
import { Subtask, SubtaskSchema } from "src/task/schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subtask.name, schema: SubtaskSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: SubtaskConfirmation.name, schema: SubtaskConfirmationSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    ConfirmationModule,
    AuthModule,
    forwardRef(() => TaskModule),
  ],
  providers: [
    NotificationGateway,
    NotificationService,
    NotificationMapperService,
    UserMapperService,
    ProfileEffectMapperService,
    UserAvatarEffectMapperService,
  ],
  exports: [NotificationGateway, NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
