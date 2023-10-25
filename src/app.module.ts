import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModule } from './task/task.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { ImageModule } from './image/image.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
