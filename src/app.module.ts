import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import * as Joi from "joi";

import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CategoryModule } from "./category/category.module";
import { ConfirmationModule } from "./confirmation/confirmation.module";
import { DatabaseModule } from "./database";
import { ImageModule } from "./image/image.module";
import { NotificationModule } from "./notification/notification.module";
import { TaskModule } from "./task/task.module";
import { UserModule } from "./user/user.module";
import { BoardModule } from "./board/board.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        MONGODB_DB_NAME: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
      }),
    }),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: "30d" },
    }),
    DatabaseModule,
    UserModule,
    TaskModule,
    CategoryModule,
    AuthModule,
    ImageModule,
    NotificationModule,
    ConfirmationModule,
    AdminModule,
    BoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
