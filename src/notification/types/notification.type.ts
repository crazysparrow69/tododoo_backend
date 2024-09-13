export enum NotificationServerEvents {
  NEW_SUBTASK_CONFIRMATION = "newSubtaskConfitmation",
  DEL_SUBTASK_CONFIRMATION = "delSubtaskConfirmation",
  NEW_NOTIFICATION = "newNotification",
  ERROR = "error",
}

export enum NotificationClientEvents {
  SUBTASK_CONFIRM = "subtaskConfirm",
  SUBTASK_REJECT = "subtaskReject",
}

export enum NotificationTypes {
  SUBTASK_CONFIRMED = "subtaskConfirmed",
  SUBTASK_REJECTED = "subtaskRejected",
}
