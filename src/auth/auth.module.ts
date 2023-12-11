import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { AuthGuard } from './guards/auth.guard';
import { User, UserSchema } from '../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthGuard],
})
export class AuthModule {}
