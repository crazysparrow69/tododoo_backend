import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

import { ConfirmationModule } from './../confirmation/confirmation.module';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from 'src/user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfirmationModule,
    AuthModule,
  ],
  providers: [NotificationGateway],
})
export class NotificationModule {}
