import { Injectable } from "@nestjs/common";

import { Board, BoardColumn, BoardTag, BoardTask } from "./board.schema";
import {
  BoardBaseResponseDto,
  BoardColumnResponseDto,
  BoardResponseDto,
  BoardTagResponseDto,
  BoardColumnTaskResponseDto,
} from "./dtos";
import { UserMapperService } from "src/user/user-mapper.service";
import { mapDocuments } from "src/common/mapDocuments";

@Injectable()
export class BoardMapperService {
  constructor(private readonly userMapperService: UserMapperService) {}

  toTag(tag: BoardTag): BoardTagResponseDto {
    return {
      _id: tag._id.toString(),
      title: tag.title,
      color: tag.color,
    };
  }

  toTask(task: BoardTask): BoardColumnTaskResponseDto {
    return {
      _id: task._id.toString(),
      title: task.title,
      ...(task.description ? { description: task.description } : {}),
      assignees: this.userMapperService.toUserReferences(task.assigneeIds),
      tags: this.toTags(task.tagIds),
      order: task.order,
    };
  }

  toColumn(column: BoardColumn): BoardColumnResponseDto {
    return {
      _id: column._id.toString(),
      title: column.title,
      order: column.order,
      tasks: this.toTasks(column.tasks),
    };
  }

  toBoard(board: Board): BoardResponseDto {
    return {
      _id: board._id.toString(),
      title: board.title,
      description: board.description,
      creatorId: board.userId.toString(),
      members: this.userMapperService.toUserReferences(board.userIds),
      columns: this.toColumns(board.columns),
      tags: this.toTags(board.tagIds),
      updatedAt: board.updatedAt,
    };
  }

  toBaseBoard(board: Board): BoardBaseResponseDto {
    return {
      _id: board._id.toString(),
      title: board.title,
      description: board.description,
      creatorId: board.userId.toString(),
      membersCount: board.userIds.length,
      updatedAt: board.updatedAt,
    };
  }

  toTags(tags: BoardTag[]): BoardTagResponseDto[] {
    return mapDocuments<BoardTag, BoardTagResponseDto>(
      tags,
      this.toTag.bind(this)
    );
  }

  toTasks(tasks: BoardTask[]): BoardColumnTaskResponseDto[] {
    return mapDocuments<BoardTask, BoardColumnTaskResponseDto>(
      tasks,
      this.toTask.bind(this)
    );
  }

  toColumns(columns: BoardColumn[]): BoardColumnResponseDto[] {
    return mapDocuments<BoardColumn, BoardColumnResponseDto>(
      columns,
      this.toColumn.bind(this)
    );
  }

  toBaseBoards(boards: Board[]): BoardBaseResponseDto[] {
    return mapDocuments<Board, BoardBaseResponseDto>(
      boards,
      this.toBaseBoard.bind(this)
    );
  }
}
