import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";

import {
  Board,
  BoardDocument,
  BoardTag,
  BoardTagDocument,
} from "./board.schema";
import {
  BoardBaseResponseDto,
  CreateBoardDto,
  CreateBoardColumnDto,
  CreateBoardTagDto,
  CreateBoardCategoryTaskDto,
  UpdateBoardDto,
  UpdateBoardColumnDto,
  UpdateBoardTagDto,
  UpdateBoardCategoryTaskDto,
  MoveBoardCategoryTaskDto,
} from "./dtos";
import { transaction } from "src/common/transaction";
import { BoardMapperService } from "./board-mapper.service";
import {
  BoardColumnResponseDto,
  BoardResponseDto,
  BoardTagResponseDto,
  BoardColumnTaskResponseDto,
} from "./dtos";
import { ApiResponseStatus, WithPagination } from "src/common/interfaces";
import { User, UserDocument } from "src/user/user.schema";
import { BOARD } from "src/common/constants";
import { getBoardPopulate } from "./board.populate";

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    @InjectModel(BoardTag.name)
    private readonly boardTagModel: Model<BoardTagDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly boardMapperService: BoardMapperService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async createBoard(
    userId: string,
    dto: CreateBoardDto
  ): Promise<BoardBaseResponseDto> {
    const newBoard = new this.boardModel({ ...dto, userId });

    newBoard.userIds.push(userId as any);

    await newBoard.save();

    return this.boardMapperService.toBaseBoard(newBoard);
  }

  async findBoards(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<WithPagination<BoardBaseResponseDto>> {
    const [total, boards] = await Promise.all([
      this.boardModel.countDocuments({ userIds: userId }),
      this.boardModel
        .find(
          { userIds: userId },
          { __v: 0, columns: 0, tags: 0, createdAt: 0 }
        )
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return {
      results: this.boardMapperService.toBaseBoards(boards),
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBoard(userId: string, boardId: string): Promise<BoardResponseDto> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userIds: userId })
      .populate(getBoardPopulate())
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

  async addUser(
    userId: string,
    boardId: string,
    targetUserId: string
  ): Promise<ApiResponseStatus> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException("Target user id is not a valid mongo id");
    }

    const targetUser = await this.userModel.findById(targetUserId).lean();
    if (!targetUser) {
      throw new NotFoundException("Target user not found");
    }

    const board = await this.boardModel.findOne({ _id: boardId, userId });
    if (!board) {
      throw new NotFoundException("Board not found");
    }
    if (board.userIds.includes(targetUserId as any)) {
      throw new BadRequestException("This user is already in the board");
    }
    if (board.userIds.length >= BOARD.USER_IDS.MAX) {
      throw new BadRequestException(
        `Cannot add more than ${BOARD.USER_IDS.MAX} users to a board`
      );
    }

    board.userIds.push(targetUserId as any);
    board.updatedAt = new Date();

    await board.save();

    return { success: true };
  }

  async removeUser(
    userId: string,
    boardId: string,
    targetUserId: string
  ): Promise<ApiResponseStatus> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException("Target user id is not a valid mongo id");
    }
    if (userId === targetUserId) {
      throw new BadRequestException(
        "The creator cannot remove himself from the board"
      );
    }

    const board = await this.boardModel
      .findOneAndUpdate(
        { _id: boardId, userId },
        { $pull: { userIds: targetUserId }, updatedAt: new Date() }
      )
      .lean();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    return { success: true };
  }

  async leave(userId: string, boardId: string): Promise<ApiResponseStatus> {
    const board = await this.boardModel.findOne({
      _id: boardId,
      userIds: userId,
    });
    if (!board) {
      throw new NotFoundException("Board not found");
    }
    if (board.userId.toString() === userId) {
      throw new BadRequestException("Creator cannot leave the board");
    }

    board.userIds = board.userIds.filter((id) => id.toString() !== userId);
    board.updatedAt = new Date();

    await board.save();

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

        if (board.tagIds.length > 0) {
          await this.boardTagModel.deleteMany(
            {
              _id: { $in: board.tagIds },
            },
            { session }
          );
        }
      });

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async createColumn(
    userId: string,
    boardId: string,
    dto: CreateBoardColumnDto
  ): Promise<BoardColumnResponseDto> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }
    if (board.columns.length >= BOARD.COLUMNS.MAX) {
      throw new NotFoundException(
        `Cannot create more than ${BOARD.COLUMNS.MAX} columns on a board`
      );
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
    dto: UpdateBoardColumnDto
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
    dto: CreateBoardCategoryTaskDto
  ): Promise<BoardColumnTaskResponseDto> {
    if (dto.assigneeIds?.length > 0) {
      const existingAssigneesCount = await this.userModel
        .find({ _id: { $in: dto.assigneeIds } })
        .countDocuments();
      if (existingAssigneesCount !== dto.assigneeIds.length) {
        throw new BadRequestException("One or several assignee ids are ivalid");
      }
    }

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
    if (column.tasks.length >= BOARD.COLUMNS.TASKS.MAX) {
      throw new BadRequestException(
        `Cannot create more than ${BOARD.COLUMNS.TASKS.MAX} tasks on a column`
      );
    }

    if (dto.tagIds?.length > 0) {
      this.validateTaskTags(board, dto.tagIds);
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
    dto: UpdateBoardCategoryTaskDto
  ): Promise<ApiResponseStatus> {
    if (dto.assigneeIds?.length > 0) {
      const existingAssigneesCount = await this.userModel
        .find({ _id: { $in: dto.assigneeIds } })
        .countDocuments();
      if (existingAssigneesCount !== dto.assigneeIds.length) {
        throw new BadRequestException("One or several assignee ids are ivalid");
      }
    }

    const board = await this.boardModel
      .findOne({ _id: boardId, userIds: userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    if (dto.tagIds?.length > 0) {
      this.validateTaskTags(board, dto.tagIds);
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

    Object.assign(task, dto, { updatedAt: new Date() });
    column.updatedAt = new Date();
    board.updatedAt = new Date();

    await board.save();

    return { success: true };
  }

  async moveTask(
    userId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    dto: MoveBoardCategoryTaskDto
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userIds: userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const fromColumn = board.columns.id(columnId);
    if (!fromColumn) {
      throw new NotFoundException("Source column not found");
    }

    const toColumn = board.columns.id(dto.targetColumnId);
    if (!toColumn) {
      throw new NotFoundException("Target column not found");
    }
    if (toColumn.tasks.length > BOARD.COLUMNS.TASKS.MAX) {
      throw new BadRequestException(
        `Column cannot have more than ${BOARD.COLUMNS.TASKS.MAX} tasks`
      );
    }

    const task = fromColumn.tasks.id(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const removedOrder = task.order;
    fromColumn.tasks.pull(taskId);
    fromColumn.tasks.forEach((t) => {
      if (t.order > removedOrder) {
        t.order--;
      }
    });
    fromColumn.updatedAt = new Date();

    let newOrder: number;

    if (dto.order !== undefined) {
      if (dto.order > toColumn.tasks.length) {
        throw new BadRequestException(
          `Order must be less than or equal to ${toColumn.tasks.length}`
        );
      }
      newOrder = dto.order;
      toColumn.tasks.forEach((t) => {
        if (t.order >= newOrder) {
          t.order++;
        }
      });
    } else {
      newOrder = toColumn.tasks.length;
    }

    task.order = newOrder;
    toColumn.tasks.push(task);
    toColumn.updatedAt = new Date();
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
        },
        {
          $pull: {
            "columns.$[col].tasks": { _id: taskId },
          },
          updatedAt: new Date(),
        },
        {
          new: true,
          arrayFilters: [{ "col._id": columnId }],
        }
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
    dto: CreateBoardTagDto
  ): Promise<BoardTagResponseDto> {
    try {
      const board = await this.boardModel
        .findOne({ _id: boardId, userId })
        .exec();
      if (!board) {
        throw new NotFoundException("Board not found");
      }
      if (board.tagIds.length > BOARD.TAG_IDS.MAX) {
        throw new BadRequestException(
          `Cannot create more than ${BOARD.TAG_IDS.MAX} tags on a board`
        );
      }

      const newTag = await transaction<BoardTag>(
        this.connection,
        async (session) => {
          const tag = new this.boardTagModel(dto);
          await tag.save({ session });

          board.tagIds.push(tag);
          board.updatedAt = new Date();
          await board.save({ session });

          return tag;
        }
      );

      return this.boardMapperService.toTag(newTag);
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateTag(
    userId: string,
    boardId: string,
    tagId: string,
    dto: UpdateBoardTagDto
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel.findOne(
      { _id: boardId, userId },
      { tagIds: 1 }
    );
    if (!board) {
      throw new NotFoundException("Board not found");
    }
    if (
      !(board.tagIds as any).some(
        (id: Types.ObjectId) => id.toString() === tagId
      )
    ) {
      throw new NotFoundException("Tag doesn't exist on the board");
    }

    try {
      await transaction(this.connection, async (session) => {
        const updatedTag = await this.boardTagModel
          .findOneAndUpdate(
            { _id: tagId },
            { ...dto, updatedAt: new Date() },
            { session }
          )
          .lean();
        if (!updatedTag) {
          throw new NotFoundException("Tag not found");
        }

        board.updatedAt = new Date();

        await board.save({ session });
      });

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
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
    if (!board.tagIds.includes(tagId as any)) {
      throw new NotFoundException("Tag doesn't exit on the board");
    }

    try {
      await transaction(this.connection, async (session) => {
        const deletedTag = await this.boardTagModel.findOneAndDelete(
          { _id: tagId },
          { session }
        );
        if (!deletedTag) {
          throw new NotFoundException("Tag not found");
        }

        board.tagIds = board.tagIds.filter((id) => id.toString() !== tagId);
        board.columns.forEach((col) => {
          col.tasks.forEach((task) => {
            if (task.tagIds?.length) {
              task.tagIds = task.tagIds.filter((id) => id.toString() !== tagId);
            }
          });
        });

        await board.save({ session });
      });

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

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
    const boardTagIds = board.tagIds.map((tagId) =>
      typeof tagId === "string" ? tagId : tagId._id.toString()
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
