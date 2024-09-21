import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Types } from "mongoose";

import { UpdateNotificationDto } from "./dtos";
import { CurrentUser } from "../auth/decorators";
import { AuthGuard, BannedUserGuard } from "../auth/guards";
import { NotificationService } from "../notification/notification.service";

@UseGuards(AuthGuard)
@Controller("notification")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get("/")
  getAllNotifications(
    @CurrentUser() userId: Types.ObjectId,
    @Query() query: any
  ) {
    const { page = 1, limit = 10, skip = 0 } = query;
    return this.notificationService.getAllNotifications(
      userId,
      +page,
      +limit,
      +skip
    );
  }

  @Patch("/:id")
  @UseGuards(BannedUserGuard)
  update(
    @CurrentUser() userId: Types.ObjectId,
    @Param("id") id: string,
    @Body() body: UpdateNotificationDto
  ) {
    return this.notificationService.update(userId, id, body);
  }
}
