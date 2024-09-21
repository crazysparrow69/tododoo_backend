import { SubtaskAssignedDto } from "./subtask-assigned.dto";
import { CategoryResponseDto } from "../../../category/dtos";
import { TaskTypes } from "../../../task/types";

export class TaskResponseDto {
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  categories: CategoryResponseDto[];
  links: string[];
  subtasks: SubtaskAssignedDto[];
  dateOfCompletion: Date | null;
  deadline: Date | null;
  type: TaskTypes.TASK;
}
