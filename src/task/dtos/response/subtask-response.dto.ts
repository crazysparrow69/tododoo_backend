import { CategoryResponseDto } from "src/category/dtos";
import { TaskTypes, UserReference } from "src/task/types";

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
