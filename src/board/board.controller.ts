import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { BoardService } from "./board.service";
import { AuthGuard, BannedUserGuard } from "src/auth/guards";
import { CurrentUser } from "src/auth/decorators";
import {
  BoardBaseResponseDto,
  BoardColumnResponseDto,
  BoardResponseDto,
  BoardTagResponseDto,
  BoardColumnTaskResponseDto,
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
import { ApiResponseStatus } from "src/common/interfaces";

@Controller("board")
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get(":id")
  getBoard(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<BoardResponseDto> {
    return this.boardService.findBoard(userId, id);
  }

  @Get("")
  getBoards(@CurrentUser() userId: string): Promise<BoardBaseResponseDto[]> {
    return this.boardService.findBoards(userId);
  }

  @Post("")
  @UseGuards(BannedUserGuard)
  createBoard(
    @CurrentUser() userId: string,
    @Body() body: CreateBoardDto
  ): Promise<BoardBaseResponseDto> {
    return this.boardService.createBoard(userId, body);
  }

  @Patch(":id")
  @UseGuards(BannedUserGuard)
  updateBoard(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() body: UpdateBoardDto
  ): Promise<ApiResponseStatus> {
    return this.boardService.updateBoard(userId, id, body);
  }

  @Post(":id/add-user/:targetUserId")
  @UseGuards(BannedUserGuard)
  addUser(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Param("targetUserId") targetUserId: string
  ): Promise<ApiResponseStatus> {
    return this.boardService.addUser(userId, id, targetUserId);
  }

  @Delete(":id/remove-user/:targetUserId")
  @UseGuards(BannedUserGuard)
  removeUser(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Param("targetUserId") targetUserId: string
  ): Promise<ApiResponseStatus> {
    return this.boardService.removeUser(userId, id, targetUserId);
  }

  @Delete(":id")
  @UseGuards(BannedUserGuard)
  removeBoard(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<ApiResponseStatus> {
    return this.boardService.deleteBoard(userId, id);
  }

  @Post(":boardId/column")
  @UseGuards(BannedUserGuard)
  createColumn(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Body() body: CreateBoardColumnDto
  ): Promise<BoardColumnResponseDto> {
    return this.boardService.createColumn(userId, boardId, body);
  }

  @Patch(":boardId/column/:columnId")
  @UseGuards(BannedUserGuard)
  updateColumn(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Body() body: UpdateBoardColumnDto
  ): Promise<ApiResponseStatus> {
    return this.boardService.updateColumn(userId, boardId, columnId, body);
  }

  @Delete(":boardId/column/:columnId")
  @UseGuards(BannedUserGuard)
  removeColumn(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string
  ): Promise<ApiResponseStatus> {
    return this.boardService.deleteColumn(userId, boardId, columnId);
  }

  @Post(":boardId/column/:columnId/task")
  @UseGuards(BannedUserGuard)
  createTask(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Body() body: CreateBoardCategoryTaskDto
  ): Promise<BoardColumnTaskResponseDto> {
    return this.boardService.createTask(userId, boardId, columnId, body);
  }

  @Patch(":boardId/column/:columnId/task/:taskId")
  @UseGuards(BannedUserGuard)
  updateTask(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Param("taskId") taskId: string,
    @Body() body: UpdateBoardCategoryTaskDto
  ): Promise<ApiResponseStatus> {
    return this.boardService.updateTask(
      userId,
      boardId,
      columnId,
      taskId,
      body
    );
  }

  @Post(":boardId/column/:columnId/task/:taskId/move")
  @UseGuards(BannedUserGuard)
  moveTaskToAnotherColumn(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Param("taskId") taskId: string,
    @Body() body: MoveBoardCategoryTaskDto
  ): Promise<ApiResponseStatus> {
    return this.boardService.moveTask(userId, boardId, columnId, taskId, body);
  }

  @Delete(":boardId/column/:columnId/task/:taskId")
  @UseGuards(BannedUserGuard)
  removeTask(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Param("taskId") taskId: string
  ): Promise<ApiResponseStatus> {
    return this.boardService.deleteTask(userId, boardId, columnId, taskId);
  }

  @Post(":boardId/tag")
  @UseGuards(BannedUserGuard)
  createTag(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Body() body: CreateBoardTagDto
  ): Promise<BoardTagResponseDto> {
    return this.boardService.createTag(userId, boardId, body);
  }

  @Patch(":boardId/tag/:tagId")
  @UseGuards(BannedUserGuard)
  updateTag(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("tagId") tagId: string,
    @Body() body: UpdateBoardTagDto
  ): Promise<ApiResponseStatus> {
    return this.boardService.updateTag(userId, boardId, tagId, body);
  }

  @Delete(":boardId/tag/:tagId")
  @UseGuards(BannedUserGuard)
  removeTag(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("tagId") tagId: string
  ): Promise<ApiResponseStatus> {
    return this.boardService.deleteTag(userId, boardId, tagId);
  }
}
