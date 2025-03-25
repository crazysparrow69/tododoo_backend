// board.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";

import {
  Board,
  BoardColumn,
  BoardDocument,
  BoardTag,
  BoardTagDocument,
  BoardTask,
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

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    @InjectModel(BoardTag.name)
    private readonly boardTagModel: Model<BoardTagDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async createBoard(userId: string, dto: CreateBoardDto): Promise<Board> {
    const newBoard = new this.boardModel({ ...dto, userId });

    newBoard.userIds.push(userId as any);

    return newBoard.save();
  }

  async findBoards(userId: string): Promise<Board[]> {
    return this.boardModel
      .find({ userIds: userId }, { __v: 0, userIds: 0, columns: 0, tags: 0 })
      .sort({ updatedAt: -1 })
      .lean();
  }

  async findBoard(userId: string, boardId: string): Promise<Board> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userIds: userId })
      .populate([
        {
          path: "tags",
          model: "BoardTag",
        },
        {
          path: "columns",
          populate: {
            path: "tasks",
            populate: {
              path: "tags",
              model: "BoardTag",
            },
          },
        },
      ])
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

    return board;
  }

  async updateBoard(
    userId: string,
    boardId: string,
    dto: UpdateBoardDto
  ): Promise<Board> {
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

    return board;
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
  ): Promise<BoardColumn> {
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

    return newColumn;
  }

  async updateColumn(
    userId: string,
    boardId: string,
    columnId: string,
    dto: UpdateColumnDto
  ): Promise<BoardColumn> {
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

    return column;
  }

  async deleteColumn(
    userId: string,
    boardId: string,
    columnId: string
  ): Promise<{ success: boolean }> {
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
  ): Promise<BoardTask> {
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

    return newTask;
  }

  async updateTask(
    userId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    dto: UpdateTaskDto
  ): Promise<BoardTask> {
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

    return task;
  }

  async deleteTask(
    userId: string,
    boardId: string,
    columnId: string,
    taskId: string
  ): Promise<{ success: boolean }> {
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
  ): Promise<BoardTag> {
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

      return newTag;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateTag(
    userId: string,
    boardId: string,
    tagId: string,
    dto: UpdateTagDto
  ): Promise<BoardTag> {
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

    return updatedTag;
  }

  async deleteTag(
    userId: string,
    boardId: string,
    tagId: string
  ): Promise<{ success: boolean }> {
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
