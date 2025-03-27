import { SubtaskResponseDto } from "./subtask-response.dto";
import { UserReference } from "../../../common/interfaces";

export class SubtaskFullDto extends SubtaskResponseDto {
  isConfirmed: boolean;
  isRejected: boolean;
  assignee: UserReference;
}
