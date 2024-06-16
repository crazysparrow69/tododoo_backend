import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { TaskModule } from "../task/task.module";
import { User, UserSchema } from "../user/user.schema";
import { ConfirmationModule } from "./../confirmation/confirmation.module";
import { NotificationController } from "./notification.controller";
import { NotificationGateway } from "./notification.gateway";
import { NotificationService } from "./notification.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfirmationModule,
    AuthModule,
    forwardRef(() => TaskModule),
  ],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationGateway, NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
