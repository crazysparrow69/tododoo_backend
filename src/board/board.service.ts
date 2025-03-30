import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, PopulateOptions, Types } from "mongoose";

import {
  Board,
  BoardDocument,
  BoardTag,
  BoardTagDocument,
} from "./board.schema";
import {
  BoardBaseResponseDto,
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
import {
  BoardColumnResponseDto,
  BoardResponseDto,
  BoardTagResponseDto,
  BoardTaskResponseDto,
} from "./dtos";
import { ApiResponseStatus } from "src/common/interfaces";
import { User, UserDocument } from "src/user/user.schema";

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

  async findBoards(userId: string): Promise<BoardBaseResponseDto[]> {
    const boards = await this.boardModel
      .find({ userIds: userId }, { __v: 0, columns: 0, tags: 0, createdAt: 0 })
      .sort({ updatedAt: -1 })
      .lean();

    return this.boardMapperService.toBaseBoards(boards);
  }

  async findBoard(userId: string, boardId: string): Promise<BoardResponseDto> {
    const populateParams = [
      {
        path: "tagIds",
        model: "BoardTag",
        select: "-__v -createdAt -updatedAt",
      },
      {
        path: "columns",
        populate: {
          path: "tasks",
          populate: [
            {
              path: "tagIds",
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
      {
        path: "userIds",
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
    ];

    const board = await this.boardModel
      .findOne({ _id: boardId, userIds: userId })
      .populate(populateParams)
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

    const board = await this.boardModel
      .findOne(
        { _id: boardId, userId },
      );
    if (!board) {
      throw new NotFoundException("Board not found");
    }
    if (board.userIds.includes(targetUserId as any)) {
      throw new BadRequestException("This user is already in the board")
    }

    board.userIds.push(targetUserId as any);

    await board.save()

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
        { $pull: { userIds: targetUserId } }
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
    if (dto.assigneeId) {
      const assignee = await this.userModel.findById(dto.assigneeId);
      if (!assignee) {
        throw new BadRequestException(
          "Assignee id should belong to an existing user"
        );
      }
    }

    if (dto.tagIds?.length > 0) {
      if (!dto.tagIds.every((id) => Types.ObjectId.isValid(id))) {
        throw new BadRequestException("One or several tag ids are ivalid");
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
    dto: UpdateTaskDto
  ): Promise<ApiResponseStatus> {
    if (dto.assigneeId) {
      const assignee = await this.userModel.findById(dto.assigneeId);
      if (!assignee) {
        throw new BadRequestException(
          "Assignee id should belong to an existing user"
        );
      }
    }

    if (dto.tagIds?.length > 0) {
      if (!dto.tagIds.every((id) => Types.ObjectId.isValid(id))) {
        throw new BadRequestException("One or several tag ids are ivalid");
      }

      const existingTags = await this.boardTagModel
        .find({ _id: { $in: dto.tagIds } })
        .select("_id")
        .lean();
      if (existingTags.length !== dto.tagIds.length) {
        throw new NotFoundException("One or several tag ids are ivalid");
      }
    }

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

    if (dto.tagIds?.length > 0) {
      this.validateTaskTags(board, dto.tagIds);
    }

    Object.assign(task, dto, { updatedAt: new Date() });
    column.updatedAt = new Date();
    board.updatedAt = new Date();

    await board.save();

    return { success: true };
  }

  async moveTaskToColumn(
    userId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    toColumnId: string
  ): Promise<ApiResponseStatus> {
    const board = await this.boardModel
      .findOne({ _id: boardId, userId })
      .exec();
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const fromColumn = board.columns.id(columnId);
    if (!fromColumn) {
      throw new NotFoundException("Column not found");
    }

    const toColumn = board.columns.id(toColumnId);
    if (!toColumn) {
      throw new NotFoundException("Column not found");
    }

    const task = fromColumn.tasks.id(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    fromColumn.tasks.pull(taskId);
    toColumn.tasks.push(task);

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

          board.tagIds.push(tag);
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
    if (!board.tagIds.includes(tagId as any)) {
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
    if (!board.tagIds.includes(tagId as any)) {
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

        board.tagIds = board.tagIds.filter((tag) => (tag as any) !== tagId);
        await board.save({ session });
      });

      return { success: true };
    } catch (err) {
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
