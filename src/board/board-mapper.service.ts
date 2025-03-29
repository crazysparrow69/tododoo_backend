import { Injectable } from "@nestjs/common";

import { Board, BoardColumn, BoardTag, BoardTask } from "./board.schema";
import {
  BoardBaseResponseDto,
  BoardColumnResponseDto,
  BoardResponseDto,
  BoardTagResponseDto,
  BoardTaskResponseDto,
} from "./dtos";
import { UserMapperService } from "src/user/user-mapper.service";

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

  toTask(task: BoardTask): BoardTaskResponseDto {
    return {
      _id: task._id.toString(),
      title: task.title,
      ...(task.description ? { description: task.description } : {}),
      ...(task.assigneeId
        ? { assignee: this.userMapperService.toUserReference(task.assigneeId) }
        : {}),
      tags: this.toTags(task.tagIds),
      order: task.order,
    };
  }

  toColumn(column: BoardColumn): BoardColumnResponseDto {
    return {
      _id: column._id.toString(),
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

  private toTags(tags: BoardTag[]): BoardTagResponseDto[] {
    const result: BoardTagResponseDto[] = [];

    for (const tag of tags) {
      const mappedTag = this.toTag(tag);
      result.push(mappedTag);
    }

    return result;
  }

  private toTasks(tasks: BoardTask[]): BoardTaskResponseDto[] {
    const result: BoardTaskResponseDto[] = [];

    for (const task of tasks) {
      const mappedTasks = this.toTask(task);
      result.push(mappedTasks);
    }

    return result;
  }

  private toColumns(columns: BoardColumn[]): BoardColumnResponseDto[] {
    const result: BoardColumnResponseDto[] = [];

    for (const column of columns) {
      const mappedColumns = this.toColumn(column);
      result.push(mappedColumns);
    }

    return result;
  }

  toBaseBoards(boards: Board[]): BoardBaseResponseDto[] {
    const result: BoardBaseResponseDto[] = [];

    for (const board of boards) {
      const mappedBoard = this.toBaseBoard(board);
      result.push(mappedBoard);
    }

    return result;
  }
}
