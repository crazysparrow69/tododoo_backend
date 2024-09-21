import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SessionSchema, Session } from "src/auth/session.schema";
import { UserModule } from "src/user/user.module";
import { User, UserSchema } from "src/user/user.schema";

import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    forwardRef(() => AuthModule),
    UserModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
