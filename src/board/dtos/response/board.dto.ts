import { BoardBaseResponseDto } from "./board-base.dto";
import { BoardColumnResponseDto } from "./board-column.dto";
import { BoardTagResponseDto } from "./board-tag.dto";

export class BoardResponseDto extends BoardBaseResponseDto {
  columns: BoardColumnResponseDto[];
  tags: BoardTagResponseDto[];
}
