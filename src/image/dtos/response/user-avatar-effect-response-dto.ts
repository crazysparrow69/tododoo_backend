export class UserAvatarEffectResponseDto {
  _id: string;
  preview: string;
  animated: string;
}

export class UserAvatarEffectFullResponseDto extends UserAvatarEffectResponseDto {
  title: string;
}
