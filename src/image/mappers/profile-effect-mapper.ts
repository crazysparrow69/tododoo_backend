import { Injectable } from "@nestjs/common";

import { ProfileEffect } from "../schemas/profile-effect.schema";
import {
  ProfileEffectFullResponseDto,
  ProfileEffectResponseDto,
} from "../dtos/response/profile-effect-response.dto";

@Injectable()
export class ProfileEffectMapperService {
  toProfileEffect(profileEffect: ProfileEffect): ProfileEffectResponseDto {
    return {
      intro: profileEffect.intro.url || "",
      preview: profileEffect.preview.url,
      sides: profileEffect.sides.url,
      top: profileEffect.top?.url || "",
    };
  }

  toProfileEffectFull(
    profileEffect: ProfileEffect
  ): ProfileEffectFullResponseDto {
    return {
      title: profileEffect.title,
      intro: profileEffect.intro.url || "",
      preview: profileEffect.preview.url,
      sides: profileEffect.sides.url,
      top: profileEffect.top?.url || "",
    };
  }

  toProfileEffectsFull(
    profileEffects: ProfileEffect[]
  ): ProfileEffectFullResponseDto[] {
    const result: ProfileEffectFullResponseDto[] = [];

    for (const profileEffect of profileEffects) {
      const mappedProfileEffect = this.toProfileEffectFull(profileEffect);
      result.push(mappedProfileEffect);
    }

    return result;
  }
}
