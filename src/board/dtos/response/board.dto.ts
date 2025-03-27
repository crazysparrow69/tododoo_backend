import { BoardColumnResponseDto } from "./board-column.dto";
import { BoardTagResponseDto } from "./board-tag.dto";

export class BoardResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  memberIds: string[];
  updatedAt: Date;
  columns: BoardColumnResponseDto[];
  tags: BoardTagResponseDto[];
}
