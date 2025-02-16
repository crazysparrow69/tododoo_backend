import { Injectable } from "@nestjs/common";

import { UserBaseDto, UserProfileDto } from "./dtos";
import { User } from "./user.schema";
import { ProfileEffectMapperService } from "../image/mappers/profile-effect-mapper";
import { ProfileEffect } from "src/image/schemas/profile-effect.schema";

@Injectable()
export class UserMapperService {
  constructor(
    private readonly profileEffectMapperService: ProfileEffectMapperService
  ) {}

  toUserBase(user: User): UserBaseDto {
    return {
      _id: user._id.toString(),
      username: user.username,
      avatar: user.avatarId?.url ? user.avatarId.url : "",
      ...(user.profileEffectId
        ? {
            profileEffect: this.profileEffectMapperService.toProfileEffect(
              user.profileEffectId as ProfileEffect
            ),
          }
        : {}),
      isBanned: user.isBanned,
    };
  }

  toUsersBase(users: User[]): UserBaseDto[] {
    const result: UserBaseDto[] = [];

    for (const user of users) {
      const mappedUser = this.toUserBase(user);
      result.push(mappedUser);
    }

    return result;
  }

  toUserProfile(user: User): UserProfileDto {
    return {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      avatar: user.avatarId?.url ? user.avatarId.url : "",
      ...(user.profileEffectId
        ? {
            profileEffect: this.profileEffectMapperService.toProfileEffect(
              user.profileEffectId as ProfileEffect
            ),
          }
        : {}),
      createdAt: user.createdAt,
      roles: user.roles,
    };
  }
}
