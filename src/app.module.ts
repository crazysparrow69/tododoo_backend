import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { TaskModule } from './task/task.module';
import { ImageModule } from './image/image.module';
import { NotificationModule } from './notification/notification.module';
import { ConfirmationModule } from './confirmation/confirmation.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';

require('dotenv').config();

const DATABASE_URI = process.env.MODE
  ? process.env.MODE.trim() === 'development'
    ? process.env.DATABASE_URI_DEV
    : process.env.DATABASE_URI_TEST
  : process.env.DATABASE_URI_PROD;

@Module({
  imports: [
    MongooseModule.forRoot(DATABASE_URI),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    UserModule,
    TaskModule,
    CategoryModule,
    AuthModule,
    ImageModule,
    NotificationModule,
    ConfirmationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
