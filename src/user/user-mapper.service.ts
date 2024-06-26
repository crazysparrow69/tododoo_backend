import { Injectable } from "@nestjs/common";

import { UserBaseDto, UserProfileDto } from "./dtos";
import { User } from "./user.schema";

@Injectable()
export class UserMapperService {
  toUserBase(user: User): UserBaseDto {
    return {
      _id: user._id.toString(),
      username: user.username,
      avatar: user.avatar?.url ? user.avatar.url : "",
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
      avatar: user.avatar?.url ? user.avatar.url : "",
      createdAt: user.createdAt,
    };
  }
}
