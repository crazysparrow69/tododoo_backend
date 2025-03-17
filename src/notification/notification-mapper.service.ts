import { Injectable } from "@nestjs/common";

import { NotificationResponseDto } from "./dtos/response/notification-response.dto";
import { Notification } from "./notification.schema";
import { NotificationTypes } from "./types";

@Injectable()
export class NotificationMapperService {
  constructor() {}

  toNotificationResponse(notification: Notification): NotificationResponseDto {
    if (
      notification.type === NotificationTypes.SUBTASK_CONFIRMED ||
      notification.type === NotificationTypes.SUBTASK_REJECTED ||
      notification.type === NotificationTypes.SUBTASK_COMPLETED
    ) {
      return {
        _id: notification._id.toString(),
        userId: notification.userId.toString(),
        actionByUser: {
          _id: notification.actionByUserId._id.toString(),
          username: notification.actionByUserId.username,
          avatar: notification.actionByUserId.avatarId?.url ?? "",
        },
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

  toNotifications(notifications: Notification[]) {
    const result: NotificationResponseDto[] = [];

    for (const notification of notifications) {
      const mappedNotification = this.toNotificationResponse(notification);
      result.push(mappedNotification);
    }

    return result;
  }
}
