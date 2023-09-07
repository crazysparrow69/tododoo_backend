import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';

require('dotenv').config();

@Module({
  imports: [UserModule, MongooseModule.forRoot(process.env.DATABASE_URI)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
