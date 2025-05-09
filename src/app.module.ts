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
import { RoadmapModule } from "./roadmap/roadmap.module";
import { MailModule } from "./mail/mail.module";
import { CodeModule } from "./code/code.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

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
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        RESEND_API_KEY: Joi.string().required(),
        EMAIL_FROM: Joi.string().email().required(),
        CLIENT_URL: Joi.string()
          .uri({ scheme: ["http", "https"] })
          .required(),
      }),
    }),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: "30d" },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000 * 60,
          limit: 10,
        },
      ],
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
    RoadmapModule,
    MailModule,
    CodeModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}
