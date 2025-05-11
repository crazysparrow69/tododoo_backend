import { IsEmail } from "class-validator";

export class ResendEmailVerificationDto {
  @IsEmail()
  email: string;
}
