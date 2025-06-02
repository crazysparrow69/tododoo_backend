import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import mongoose, { Types } from "mongoose";

import { NotificationService } from "./../notification/notification.service";
import { SubtaskFullDto, UpdateSubtaskDto } from "./dtos";
import { SubtaskService } from "./subtask.service";
import { CurrentUser } from "../auth/decorators";
import { AuthGuard, BannedUserGuard } from "../auth/guards";
import { InjectConnection } from "@nestjs/mongoose";
import { transaction } from "src/common/transaction";
import { Subtask } from "./schemas";

@Controller("subtask")
@UseGuards(AuthGuard)
export class SubtaskController {
  constructor(
    private readonly subtaskService: SubtaskService,
    private readonly notificationService: NotificationService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  @Patch(":id")
  @UseGuards(BannedUserGuard)
  updateSubtask(
    @CurrentUser() userId: Types.ObjectId,
    @Param("id") id: string,
    @Body() body: UpdateSubtaskDto
  ): Promise<SubtaskFullDto> {
    return this.subtaskService.update(userId, id, body);
  }

  @Delete(":id")
  @UseGuards(BannedUserGuard)
  async removeSubtask(
    @CurrentUser() userId: Types.ObjectId,
    @Param("id") id: string
  ) {
    return await transaction<Subtask>(this.connection, async (session) => {
      const removedSubtask = await this.subtaskService.remove(
        userId,
        id,
        session
      );
      if (
        userId.toString() !== removedSubtask.assigneeId.toString() &&
        !removedSubtask.isConfirmed &&
        !removedSubtask.isRejected
      ) {
        await this.notificationService.deleteNotifications(id, session);
      }

      return removedSubtask;
    });
  }
}
