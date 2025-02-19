import { ProfileEffectResponseDto, UserAvatarEffectResponseDto } from "../../../image/dtos";

export class UserBaseDto {
  _id: string;
  username: string;
  avatar: string;
  profileEffect?: ProfileEffectResponseDto;
  avatarEffect?: UserAvatarEffectResponseDto;
  isBanned?: boolean;
}
