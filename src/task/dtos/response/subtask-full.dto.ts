import { UserReference } from "src/task/types";

import { SubtaskResponseDto } from "./subtask-response.dto";

export class SubtaskFullDto extends SubtaskResponseDto {
  isConfirmed: boolean;
  isRejected: boolean;
  assignee: UserReference;
}
