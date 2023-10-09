import { IsString } from 'class-validator';

export class CreateAvatarDto {
  @IsString()
  image: string;
}
