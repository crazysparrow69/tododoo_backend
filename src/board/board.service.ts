import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, PopulateOptions } from "mongoose";

import {
  Board,
  BoardDocument,
  BoardTag,
  BoardTagDocument,
} from "./board.schema";
import {
  CreateBoardDto,
  CreateColumnDto,
  CreateTagDto,
  CreateTaskDto,
  UpdateBoardDto,
  UpdateColumnDto,
  UpdateTagDto,
  UpdateTaskDto,
} from "./dtos";
import { transaction } from "src/common/transaction";
import { BoardMapperService } from "./board-mapper.service";
import { BoardBaseResponseDto } from "./dtos/response/board-base.dto";
import {
  BoardColumnResponseDto,
  BoardResponseDto,
  BoardTagResponseDto,
  BoardTaskResponseDto,
} from "./dtos";
import { ApiResponseStatus } from "src/common/interfaces/response.interface";

@Injectable()
export class BoardService {
  populateParams: PopulateOptions[];
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    @InjectModel(BoardTag.name)
    private readonly boardTagModel: Model<BoardTagDocument>,
    private readonly boardMapperService: BoardMapperService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {
    this.populateParams = [
      {
        path: "tags",
        model: "BoardTag",
        select: "-__v -createdAt -updatedAt",
      },
      {
        path: "columns",
        populate: {
          path: "tasks",
          populate: [
            {
              path: "tags",
              model: "BoardTag",
              select: "-__v -createdAt -updatedAt",
            },
            {
              path: "assigneeId",
              select: "_id username avatarId avatarEffectId",
              populate: [
                {
                  path: "avatarId",
                  select: "-_id url",
                },
                {
                  path: "avatarEffectId",
                  select: "preview.url animated.url",
                },
              ],
            },
          ],
        },
      },
    ];
  }

  async createBoard(
    userId: string,
    dto: CreateBoardDto
  ): Promise<BoardBaseResponseDto> {
    const newBoard = new this.boardModel({ ...dto, userId });

    newBoard.userIds.push(userId as any);

    await newBoard.save();

    return this.boardMapperService.toBaseBoard(newBoard);
  }

  async findBoards(userId: string): Promise<BoardBaseResponseDto[]> {
    const boards = await this.boardModel
      .find({ userIds: userId }, { __v: 0, columns: 0, tags: 0, createdAt: 0 })
      .sort({ updatedAt: -1 })
      .lean();

    return this.boardMapperService.toBaseBoards(boards);
  }

  async findBoard(userId: string, boardId: string): Promise<BoardResponseDto> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userIds: userId })
      .populate(this.populateParams)
      .lean();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    if (board.columns?.length) {
      board.columns.sort((a, b) => a.order - b.order);
      board.columns.forEach((col) => {
        if (col.tasks?.length) {
          col.tasks.sort((a, b) => a.order - b.order);
        }
      });
    }

    return this.boardMapperService.toBoard(board);
  }

  async updateBoard(
    userId: string,
    boardId: string,
    dto: UpdateBoardDto
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOneAndUpdate(
        { _id: boardId, userId },
        { ...dto, updatedAt: new Date() },
        { new: true }
      )
      .lean();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    return { success: true };
  }

  async deleteBoard(
    userId: string,
    boardId: string
  ): Promise<{ success: true }> {
    try {
      await transaction(this.connection, async (session) => {
        const board = await this.boardModel
          .findOneAndDelete({ _id: boardId, userId }, { session })
          .lean();
        if (!board) {
          throw new NotFoundException("Board not found");
        }

        if (board.tags.length > 0) {
          await this.boardTagModel.deleteMany(
            {
              _id: { $in: board.tags },
            },
            { session }
          );
        }
      });

      return { success: true };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async createColumn(
    userId: string,
    boardId: string,
    dto: CreateColumnDto
  ): Promise<BoardColumnResponseDto> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const newColumn = board.columns.create({
      ...dto,
      order: board.columns.length,
    });
    board.columns.push(newColumn);
    board.updatedAt = new Date();

    await board.save();

    return this.boardMapperService.toColumn(newColumn);
  }

  async updateColumn(
    userId: string,
    boardId: string,
    columnId: string,
    dto: UpdateColumnDto
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const column = board.columns.id(columnId);
    if (!column) {
      throw new NotFoundException("Column not found");
    }

    if (dto.order !== undefined) {
      const totalColumns = board.columns.length;
      if (dto.order >= totalColumns) {
        throw new BadRequestException(
          `Order must be less than ${totalColumns - 1}`
        );
      }

      this.reorderItems(board.columns, column.order, dto.order);
    }

    Object.assign(column, dto, { updatedAt: new Date() });
    column.updatedAt = new Date();
    board.updatedAt = new Date();

    await board.save();

    return { success: true };
  }

  async deleteColumn(
    userId: string,
    boardId: string,
    columnId: string
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const column = board.columns.id(columnId);
    if (!column) {
      throw new NotFoundException("Column not found");
    }

    const deletedColumnOrder = column.order;

    column.deleteOne();

    board.columns.forEach((col) => {
      if (col.order > deletedColumnOrder) {
        col.order--;
      }
    });

    board.updatedAt = new Date();
    await board.save();

    return { success: true };
  }

  async createTask(
    userId: string,
    boardId: string,
    columnId: string,
    dto: CreateTaskDto
  ): Promise<BoardTaskResponseDto> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userIds: userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board bot found");
    }

    const column = board.columns.id(columnId);
    if (!column) {
      throw new NotFoundException("Column not found");
    }

    if (dto.tags?.length > 0) {
      this.validateTaskTags(board, dto.tags);
    }

    const newTask = column.tasks.create({
      ...dto,
      order: column.tasks.length,
    });
    column.tasks.push(newTask);
    column.updatedAt = new Date();
    board.updatedAt = new Date();

    await board.save();

    return this.boardMapperService.toTask(newTask);
  }

  async updateTask(
    userId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    dto: UpdateTaskDto
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userIds: userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const column = board.columns.id(columnId);
    if (!column) {
      throw new NotFoundException("Column not found");
    }

    const task = column.tasks.id(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    if (dto.order !== undefined) {
      const totalTasks = column.tasks.length;
      if (dto.order >= totalTasks) {
        throw new BadRequestException(
          `Order must be less than ${totalTasks - 1}`
        );
      }

      this.reorderItems(column.tasks, task.order, dto.order);
    }

    if (dto.tags?.length > 0) {
      this.validateTaskTags(board, dto.tags);
    }

    Object.assign(task, dto, { updatedAt: new Date() });
    column.updatedAt = new Date();
    board.updatedAt = new Date();

    await board.save();

    return { success: true };
  }

  async deleteTask(
    userId: string,
    boardId: string,
    columnId: string,
    taskId: string
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOneAndUpdate(
        {
          _id: boardId,
          userIds: userId,
          "columns._id": columnId,
        },
        {
          $pull: {
            "columns.$.tasks": { _id: taskId },
          },
        },
        { new: true }
      )
      .lean();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    return { success: true };
  }

  async createTag(
    userId: string,
    boardId: string,
    dto: CreateTagDto
  ): Promise<BoardTagResponseDto> {
    try {
      const board = await this.boardModel
        .findOne({ _id: boardId, userId })
        .exec();
      if (!board) {
        throw new NotFoundException("Board not found");
      }

      const newTag = await transaction<BoardTag>(
        this.connection,
        async (session) => {
          const tag = new this.boardTagModel(dto);
          await tag.save({ session });

          board.tags.push(tag);
          board.updatedAt = new Date();
          await board.save({ session });

          return tag;
        }
      );

      return this.boardMapperService.toTag(newTag);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateTag(
    userId: string,
    boardId: string,
    tagId: string,
    dto: UpdateTagDto
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userId })
      .lean();
    if (!board) {
      throw new NotFoundException("Board not found");
    }
    if (!board.tags.includes(tagId as any)) {
      throw new NotFoundException("Tag doesn't exit on the board");
    }

    const updatedTag = await this.boardTagModel
      .findOneAndUpdate({ _id: tagId }, { ...dto, updatedAt: new Date() })
      .lean();
    if (!updatedTag) {
      throw new NotFoundException("Tag not found");
    }

    return { success: true };
  }

  async deleteTag(
    userId: string,
    boardId: string,
    tagId: string
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }
    if (!board.tags.includes(tagId as any)) {
      throw new NotFoundException("Tag doesn't exit on the board");
    }

    try {
      await transaction(this.connection, async (session) => {
        const deletedTag = await this.boardTagModel.findOneAndDelete(
          {
            _id: tagId,
          },
          { session }
        );
        if (!deletedTag) {
          throw new NotFoundException("Tag not found");
        }

        board.tags = board.tags.filter((tag) => (tag as any) !== tagId);
        await board.save({ session });
      });

      return { success: true };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  //   // ---------------------------
  //   // Пример переноса задачи
  //   // (если понадобится)
  //   // ---------------------------
  //   /**
  //    * Перенести задачу из одной колонки в другую (пример)
  //    */
  //   async moveTaskToAnotherColumn(
  //     boardId: string,
  //     fromColumnId: string,
  //     toColumnId: string,
  //     taskId: string
  //   ): Promise<Board> {
  //     const board = await this.boardModel.findById(boardId).exec();
  //     if (!board) {
  //       throw new NotFoundException(`Board with id "${boardId}" not found`);
  //     }

  //     const fromColumn = board.columns.id(fromColumnId);
  //     if (!fromColumn) {
  //       throw new NotFoundException(`Column with id "${fromColumnId}" not found`);
  //     }
  //     const toColumn = board.columns.id(toColumnId);
  //     if (!toColumn) {
  //       throw new NotFoundException(`Column with id "${toColumnId}" not found`);
  //     }

  //     const task = fromColumn.tasks.id(taskId);
  //     if (!task) {
  //       throw new NotFoundException(`Task with id "${taskId}" not found`);
  //     }

  //     // Удаляем задачу из исходной колонки
  //     task.remove();
  //     // Добавляем её в новую
  //     toColumn.tasks.push(task);

  //     // При необходимости обновляем order
  //     // toColumn.tasks[toColumn.tasks.length - 1].order = ...

  //     await board.save();
  //     return board;
  //   }

  private reorderItems<T extends { [key: string]: number }>(
    items: T[],
    oldOrder: number,
    newOrder: number,
    orderKey: keyof T = "order" as keyof T
  ): void {
    if (newOrder < oldOrder) {
      items.forEach((item) => {
        if (item[orderKey] >= newOrder && item[orderKey] < oldOrder) {
          item[orderKey]++;
        }
      });
    } else if (newOrder > oldOrder) {
      items.forEach((item) => {
        if (item[orderKey] > oldOrder && item[orderKey] <= newOrder) {
          item[orderKey]--;
        }
      });
    }
  }

  private validateTaskTags(board: BoardDocument, tagIds: string[]): void {
    const boardTagIds = board.tags.map((tag) =>
      typeof tag === "string" ? tag : tag._id.toString()
    );

    for (const tagId of tagIds) {
      if (!boardTagIds.includes(String(tagId))) {
        throw new BadRequestException(
          "Tasks can have tags existing on the same board"
        );
      }
    }
  }
}
