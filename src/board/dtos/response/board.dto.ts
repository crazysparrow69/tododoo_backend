import { UserReference } from "src/common/interfaces";
import { BoardColumnResponseDto } from "./board-column.dto";
import { BoardTagResponseDto } from "./board-tag.dto";

export class BoardResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  members: UserReference[];
  updatedAt: Date;
  columns: BoardColumnResponseDto[];
  tags: BoardTagResponseDto[];
}
