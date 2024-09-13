import { Types } from "mongoose";

import { NotificationTypes } from "../types";

export class CreateNotificationDto {
  userId: Types.ObjectId;
  subtaskId?: Types.ObjectId;
  actionByUserId: Types.ObjectId;
  type: NotificationTypes;
}
