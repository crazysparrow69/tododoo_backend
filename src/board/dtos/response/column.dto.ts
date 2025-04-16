import { BoardColumnTaskResponseDto } from "./task.dto";

export class BoardColumnResponseDto {
  _id: string;
  title: string;
  order: number;
  tasks: BoardColumnTaskResponseDto[];
}
