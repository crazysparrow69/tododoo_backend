import { IsBoolean } from "class-validator";

export class UpdateUserBanStatusDto {
  @IsBoolean()
  isBanned: boolean;
}
