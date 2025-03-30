import { BoardTaskResponseDto } from "./board-task.dto";

export class BoardColumnResponseDto {
  _id: string;
  title: string;
  order: number;
  tasks: BoardTaskResponseDto[];
}
