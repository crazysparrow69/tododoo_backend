import { Module } from "@nestjs/common";
import { BoardService } from "./board.service";
import { BoardController } from "./board.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Board, BoardSchema, BoardTag, BoardTagSchema } from "./board.schema";
import { AuthModule } from "../auth/auth.module";
import { User, UserSchema } from "../user/user.schema";
import { Session, SessionSchema } from "../auth/session.schema";

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
  providers: [BoardService],
  controllers: [BoardController],
})
export class BoardModule {}
