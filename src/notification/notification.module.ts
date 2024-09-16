import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Session, SessionSchema } from "src/auth/session.schema";

import { ConfirmationModule } from "./../confirmation/confirmation.module";
import { NotificationMapperService } from "./notification-mapper.service";
import { NotificationController } from "./notification.controller";
import { NotificationGateway } from "./notification.gateway";
import { Notification, NotificationSchema } from "./notification.schema";
import { NotificationService } from "./notification.service";
import { AuthModule } from "../auth/auth.module";
import { TaskModule } from "../task/task.module";
import { User, UserSchema } from "../user/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
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
  ],
  exports: [NotificationGateway, NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
