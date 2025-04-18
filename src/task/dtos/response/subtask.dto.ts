import { CategoryResponseDto } from "../../../category/dtos";
import { UserReference } from "../../../common/interfaces";
import { TaskTypes } from "../../../task/types";

export class SubtaskResponseDto {
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  categories: CategoryResponseDto[];
  links: string[];
  creator: UserReference | null;
  dateOfCompletion: Date | null;
  deadline: Date | null;
  type: TaskTypes.SUBTASK;
}

export class SubtaskFullDto extends SubtaskResponseDto {
  isConfirmed: boolean;
  isRejected: boolean;
  assignee: UserReference;
}

export class SubtaskAssignedDto {
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isConfirmed: boolean;
  isRejected: boolean;
  links: string[];
  assignee: UserReference;
  dateOfCompletion: Date | null;
  deadline: Date | null;
}
