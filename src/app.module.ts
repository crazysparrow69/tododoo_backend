import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt/dist";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CategoryModule } from "./category/category.module";
import { ConfirmationModule } from "./confirmation/confirmation.module";
import { ImageModule } from "./image/image.module";
import { NotificationModule } from "./notification/notification.module";
import { TaskModule } from "./task/task.module";
import { UserModule } from "./user/user.module";

// eslint-disable-next-line
require("dotenv").config();

let DATABASE_URI: string;

if (process.env.MODE === "development") {
  DATABASE_URI = process.env.DATABASE_URI_DEV;
} else if (process.env.MODE === "prod") {
  DATABASE_URI = process.env.DATABASE_URI_PROD;
} else {
  DATABASE_URI = process.env.DATABASE_URI_TEST;
}

@Module({
  imports: [
    MongooseModule.forRoot(DATABASE_URI),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: "30d" },
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
