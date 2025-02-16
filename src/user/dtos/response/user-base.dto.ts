import { ProfileEffectResponseDto } from "../../../image/dtos/response/profile-effect-response.dto";

export class UserBaseDto {
  _id: string;
  username: string;
  avatar: string;
  profileEffect?: ProfileEffectResponseDto;
  isBanned?: boolean;
}
