import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { CloudinaryMedia } from "../interfaces/cloudinary";

export class CreateProfileEffectDto {
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsObject()
  preview: CloudinaryMedia;

  @IsNotEmpty()
  @IsObject()
  sides: CloudinaryMedia;

  @IsOptional()
  @IsObject()
  intro?: CloudinaryMedia;

  @IsOptional()
  @IsObject()
  top?: CloudinaryMedia;
}
