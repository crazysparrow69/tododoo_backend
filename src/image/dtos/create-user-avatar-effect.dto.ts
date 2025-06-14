import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { CloudinaryMedia } from "../interfaces/cloudinary";

export class CreateUserAvatarEffectDto {
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsObject()
  preview: CloudinaryMedia;

  @IsNotEmpty()
  @IsObject()
  animated: CloudinaryMedia;
}
