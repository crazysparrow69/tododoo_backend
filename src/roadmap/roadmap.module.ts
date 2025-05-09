import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Roadmap, RoadmapSchema } from "./roadmap.schema";
import { RoadmapService } from "./roadmap.service";
import { RoadmapController } from "./roadmap.controller";
import { AuthModule } from "src/auth/auth.module";
import { User, UserSchema } from "src/user/user.schema";
import { Session, SessionSchema } from "src/auth/session.schema";
import { RoadmapMapperService } from "./roadmap-mapper.service";
import { UserMapperService } from "src/user/user-mapper.service";
import {
  ProfileEffectMapperService,
  UserAvatarEffectMapperService,
} from "src/image/mappers";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Roadmap.name, schema: RoadmapSchema },
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    AuthModule,
  ],
  controllers: [RoadmapController],
  providers: [
    RoadmapService,
    RoadmapMapperService,
    UserMapperService,
    ProfileEffectMapperService,
    UserAvatarEffectMapperService,
  ],
})
export class RoadmapModule {}
