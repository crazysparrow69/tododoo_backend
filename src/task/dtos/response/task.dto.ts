import { CategoryResponseDto } from "../../../category/dtos";
import { TaskTypes } from "../../../task/types";
import { SubtaskAssignedDto } from "./subtask.dto";

export class TaskResponseDto {
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  categories: CategoryResponseDto[];
  links: string[];
  subtasks: SubtaskAssignedDto[];
  dateOfCompletion?: Date;
  deadline?: Date;
  type: TaskTypes.TASK;
}
