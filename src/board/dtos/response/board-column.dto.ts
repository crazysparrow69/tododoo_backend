import { BoardTaskResponseDto } from "./board-task.dto";

export class BoardColumnResponseDto {
  _id: string;
  order: number;
  tasks: BoardTaskResponseDto[];
}
