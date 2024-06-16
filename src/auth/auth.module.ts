import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { User, UserSchema } from "../user/user.schema";
import { AuthGuard } from "./guards/auth.guard";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthGuard],
})
export class AuthModule {}
