import { UserReference } from "src/common/interfaces";
import { BoardTagResponseDto } from "./board-tag.dto";

export class BoardTaskResponseDto {
  _id: string;
  title: string;
  description?: string;
  assignee?: UserReference;
  tags: BoardTagResponseDto[];
  order: number;
}
