import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards";
import { Session, SessionSchema } from "./session.schema";
import { UserModule } from "../user/user.module";
import { User, UserSchema } from "../user/user.schema";
import { CodeModule } from "src/code/code.module";
import { Code, CodeSchema } from "src/code/code.schema";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Code.name, schema: CodeSchema },
    ]),
    forwardRef(() => UserModule),
    CodeModule,
    MailModule
  ],
  providers: [AuthGuard, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
