import { UserReference } from "../../../common/interfaces";

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
