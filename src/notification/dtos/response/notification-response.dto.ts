import { UserReference } from "../../../common/interfaces";
import { NotificationTypes } from "../../../notification/types";

export class NotificationResponseDto {
  _id: string;
  userId: string;
  subtask?: {
    _id: string;
    title: string;
    description: string;
  };
  actionByUser: UserReference;
  type: NotificationTypes;
  createdAt: Date;
}
