import { Optional } from "@nestjs/common";
import { IsBoolean } from "class-validator";

export class UpdateNotificationDto {
  @Optional()
  @IsBoolean()
  isRead?: boolean;
}
