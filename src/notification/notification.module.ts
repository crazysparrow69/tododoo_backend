import { Module, forwardRef } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { TaskModule } from '../task/task.module';
import { ConfirmationModule } from './../confirmation/confirmation.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { User, UserSchema } from '../user/user.schema';

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
