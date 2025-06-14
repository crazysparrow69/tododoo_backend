export class ProfileEffectResponseDto {
  _id: string;
  intro?: string;
  preview: string;
  sides: string;
  top?: string;
}

export class ProfileEffectFullResponseDto extends ProfileEffectResponseDto {
  title: string;
}
