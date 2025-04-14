import { UserReference } from "src/common/interfaces";
import { BoardColumnResponseDto } from "./column.dto";
import { BoardTagResponseDto } from "./tag.dto";

export class BoardBaseResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  membersCount: number;
  updatedAt: Date;
}

export class BoardResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  members: UserReference[];
  columns: BoardColumnResponseDto[];
  tags: BoardTagResponseDto[];
  updatedAt: Date;
}
