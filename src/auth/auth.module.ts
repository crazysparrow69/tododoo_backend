import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards";
import { Session, SessionSchema } from "./session.schema";
import { UserModule } from "../user/user.module";
import { User, UserSchema } from "../user/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  providers: [AuthGuard, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
