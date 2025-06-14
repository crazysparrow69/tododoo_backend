import { Injectable } from "@nestjs/common";

import { UserAvatarDto } from "../dtos/response/user-avatar-response.dto";
import { UserAvatar } from "../schemas/user-avatar.schema";

@Injectable()
export class UserAvatarMapperService {
  toUserAvatar(userAvatar: UserAvatar): UserAvatarDto {
    return {
      _id: userAvatar._id.toString(),
      userId: userAvatar.userId.toString(),
      url: userAvatar.url,
      public_id: userAvatar.public_id,
    };
  }
}
