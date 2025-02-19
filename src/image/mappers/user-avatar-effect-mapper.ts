import { Injectable } from "@nestjs/common";

import { UserAvatarEffect } from "../schemas";
import { UserAvatarEffectFullResponseDto, UserAvatarEffectResponseDto } from "../dtos";

@Injectable()
export class UserAvatarEffectMapperService {
  toUserAvatarEffect(userAvatarEffect: UserAvatarEffect): UserAvatarEffectResponseDto {
    return {
      _id: userAvatarEffect._id.toString(),
      preview: userAvatarEffect.preview.url,
      animated: userAvatarEffect.animated.url,
    };
  }

  toUserAvatarEffectFull(
    userAvatarEffect: UserAvatarEffect
  ): UserAvatarEffectFullResponseDto {
    return {
      _id: userAvatarEffect._id.toString(),
      title: userAvatarEffect.title,
      preview: userAvatarEffect.preview.url,
      animated: userAvatarEffect.animated.url,
    };
  }

  toUserAvatarEffectsFull(
    userAvatarEffects: UserAvatarEffect[]
  ): UserAvatarEffectFullResponseDto[] {
    const result: UserAvatarEffectFullResponseDto[] = [];

    for (const userAvatarEffect of userAvatarEffects) {
      const mappedUserAvatarEffect = this.toUserAvatarEffectFull(userAvatarEffect);
      result.push(mappedUserAvatarEffect);
    }

    return result;
  }
}
