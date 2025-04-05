import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class GoogleOAuthDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  code: string;
}
