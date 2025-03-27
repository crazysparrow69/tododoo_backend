import { Module } from "@nestjs/common";
import { BoardService } from "./board.service";
import { BoardController } from "./board.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Board, BoardSchema, BoardTag, BoardTagSchema } from "./board.schema";
import { AuthModule } from "../auth/auth.module";
import { User, UserSchema } from "../user/user.schema";
import { Session, SessionSchema } from "../auth/session.schema";
import { BoardMapperService } from "./board-mapper.service";
import { UserMapperService } from "src/user/user-mapper.service";
import {
  ProfileEffectMapperService,
  UserAvatarEffectMapperService,
} from "src/image/mappers";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: BoardTag.name, schema: BoardTagSchema },
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    AuthModule,
  ],
  providers: [
    BoardService,
    BoardMapperService,
    UserMapperService,
    ProfileEffectMapperService,
    UserAvatarEffectMapperService,
  ],
  controllers: [BoardController],
})
export class BoardModule {}
