import { UserReference } from "src/common/interfaces";
import { BoardTagResponseDto } from "./tag.dto";

export class BoardColumnTaskResponseDto {
  _id: string;
  title: string;
  description?: string;
  assignees?: UserReference[];
  tags: BoardTagResponseDto[];
  order: number;
}
