import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class GoogleOAuthDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
