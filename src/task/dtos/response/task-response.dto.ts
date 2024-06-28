import { CategoryResponseDto } from "src/category/dtos";
import { Subtask } from "src/task/schemas";

export class TaskResponseDto {
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  categories: CategoryResponseDto[];
  links: string[];
  subtasks: Subtask[];
  dateOfCompletion: Date | null;
  deadline: Date | null;
}
