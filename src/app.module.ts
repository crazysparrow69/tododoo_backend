import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModule } from './task/task.module';
import { CategoryModule } from './category/category.module';

require('dotenv').config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URI),
    UserModule,
    TaskModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
