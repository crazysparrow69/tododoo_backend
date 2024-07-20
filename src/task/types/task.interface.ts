import { SubtaskDocument } from "../schemas";

export interface QueryParamsTask {
  userId: string;
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

export interface QueryParamsSubtask {
  assigneeId: string;
  isRejected: boolean;
  isConfirmed: boolean;
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

export interface CheckStatusForSubtask {
  foundSubtask: SubtaskDocument;
  status: string;
}
