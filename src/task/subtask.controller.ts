import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { Types } from "mongoose";

import { NotificationService } from "./../notification/notification.service";
import { UpdateSubtaskDto } from "./dtos";
import { SubtaskFullDto } from "./dtos/response";
import { SubtaskService } from "./subtask.service";
import { CurrentUser } from "../auth/decorators";
import { AuthGuard, BannedUserGuard } from "../auth/guards";

@Controller("subtask")
@UseGuards(AuthGuard)
export class SubtaskController {
  constructor(
    private readonly subtaskService: SubtaskService,
    private readonly notificationService: NotificationService
  ) {}

  @UseGuards(BannedUserGuard)
  @Patch(":id")
  updateSubtask(
    @CurrentUser() userId: Types.ObjectId,
    @Param("id") id: string,
    @Body() body: UpdateSubtaskDto
  ): Promise<SubtaskFullDto> {
    return this.subtaskService.update(userId, id, body);
  }

  @UseGuards(BannedUserGuard)
  @Delete(":id")
  async removeSubtask(
    @CurrentUser() userId: Types.ObjectId,
    @Param("id") id: string
  ) {
    const removedSubtask = await this.subtaskService.remove(userId, id);
    if (
      userId.toString() !== removedSubtask.assigneeId.toString() &&
      !removedSubtask.isConfirmed &&
      !removedSubtask.isRejected
    ) {
      await this.notificationService.deleteSubtaskConf(id);
    }
    return removedSubtask;
  }
}
