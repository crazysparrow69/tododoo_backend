import { SubtaskResponseDto } from "./subtask-response.dto";
import { UserReference } from "../../../common/types";

export class SubtaskFullDto extends SubtaskResponseDto {
  isConfirmed: boolean;
  isRejected: boolean;
  assignee: UserReference;
}
