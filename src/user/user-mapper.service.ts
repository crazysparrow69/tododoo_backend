import { Injectable } from "@nestjs/common";

import { UserBaseDto, UserProfileDto } from "./dtos";
import { User } from "./user.schema";
import {
  ProfileEffectMapperService,
  UserAvatarEffectMapperService,
} from "../image/mappers";
import { ProfileEffect, UserAvatarEffect } from "../image/schemas";
import { UserReferenceDto } from "./dtos/response";
import { mapDocuments } from "src/common/mapDocuments";

@Injectable()
export class UserMapperService {
  constructor(
    private readonly profileEffectMapperService: ProfileEffectMapperService,
    private readonly userAvatarEffectMapperService: UserAvatarEffectMapperService
  ) {}

  toUserReference(user: User): UserReferenceDto {
    return {
      _id: user._id.toString(),
      username: user.username,
      ...(user.avatarId ? { avatar: user.avatarId.url } : {}),
      ...(user.avatarEffectId
        ? {
            avatarEffect: this.userAvatarEffectMapperService.toUserAvatarEffect(
              user.avatarEffectId as UserAvatarEffect
            ),
          }
        : {}),
    };
  }

  toUserBase(user: User): UserBaseDto {
    return {
      _id: user._id.toString(),
      username: user.username,
      ...(user.avatarId ? { avatar: user.avatarId.url } : {}),
      ...(user.profileEffectId
        ? {
            profileEffect: this.profileEffectMapperService.toProfileEffect(
              user.profileEffectId as ProfileEffect
            ),
          }
        : {}),
      ...(user.avatarEffectId
        ? {
            avatarEffect: this.userAvatarEffectMapperService.toUserAvatarEffect(
              user.avatarEffectId as UserAvatarEffect
            ),
          }
        : {}),
      isBanned: user.isBanned,
    };
  }

  toUserProfile(user: User): UserProfileDto {
    return {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      ...(user.avatarId ? { avatar: user.avatarId.url } : {}),
      ...(user.profileEffectId
        ? {
            profileEffect: this.profileEffectMapperService.toProfileEffect(
              user.profileEffectId as ProfileEffect
            ),
          }
        : {}),
      ...(user.avatarEffectId
        ? {
            avatarEffect: this.userAvatarEffectMapperService.toUserAvatarEffect(
              user.avatarEffectId as UserAvatarEffect
            ),
          }
        : {}),
      roles: user.roles,
      createdAt: user.createdAt,
    };
  }

  toUserReferences(users: User[]): UserReferenceDto[] {
    return mapDocuments(users, this.toUserReference.bind(this));
  }

  toUsersBase(users: User[]): UserBaseDto[] {
    return mapDocuments(users, this.toUserBase.bind(this));
  }
}
