import { Subtask, SubtaskDocument } from "./subtask.schema";
import { Category } from "../category/category.schema";
import { User } from "../user/user.schema";

export interface QueryParamsTask {
  userId: string;
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

export interface QueryParamsSubtask {
  assigneeId: string;
  rejected: boolean;
  isConfirmed: boolean;
  isCompleted?: boolean;
  categories?: object;
  deadline?: object;
}

export interface CreatedTaskDoc {
  __v: string;
  title: string;
  description: string;
  categories: Category[];
  isCompleted: boolean;
  dateOfCompletion: Date;
  links: Array<string>;
  deadline: Date;
  subtasks: Subtask[];
  userId: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckStatusForSubtask {
  foundSubtask: SubtaskDocument;
  status: string;
}
