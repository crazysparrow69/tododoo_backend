import { Module, forwardRef } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

import { ConfirmationModule } from './../confirmation/confirmation.module';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from 'src/user/user.schema';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TaskModule } from 'src/task/task.module';

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
