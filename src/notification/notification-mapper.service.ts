import { Injectable } from "@nestjs/common";
import { NotificationResponseDto } from "./dtos/response/notification-response.dto";
import { Notification } from "./notification.schema";
import { NotificationTypes } from "./types";
import { UserMapperService } from "src/user/user-mapper.service";
import { mapDocuments } from "src/common/mapDocuments";

@Injectable()
export class NotificationMapperService {
  constructor(private readonly userMapperService: UserMapperService) {}

  toNotificationResponse(notification: Notification): NotificationResponseDto {
    if (
      notification.type === NotificationTypes.SUBTASK_CONFIRMED ||
      notification.type === NotificationTypes.SUBTASK_REJECTED ||
      notification.type === NotificationTypes.SUBTASK_COMPLETED
    ) {
      return {
        _id: notification._id.toString(),
        userId: notification.userId.toString(),
        actionByUser: this.userMapperService.toUserReference(
          notification.actionByUserId
        ),
        subtask: {
          _id: notification.subtaskId._id.toString(),
          title: notification.subtaskId.title,
          description: notification.subtaskId.description,
        },
        type: notification.type,
        createdAt: notification.createdAt,
      };
    }
  }

  toNotifications(notifications: Notification[]): NotificationResponseDto[] {
    return mapDocuments<Notification, NotificationResponseDto>(
      notifications,
      this.toNotificationResponse.bind(this)
    );
  }
}
