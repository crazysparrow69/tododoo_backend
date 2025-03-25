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
  CreateBoardDto,
  CreateColumnDto,
  CreateTagDto,
  CreateTaskDto,
  UpdateBoardDto,
  UpdateColumnDto,
  UpdateTagDto,
  UpdateTaskDto,
} from "./dtos";

@Controller("board")
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get(":id")
  getBoard(@CurrentUser() userId: string, @Param("id") id: string) {
    return this.boardService.findBoard(userId, id);
  }

  @Get("")
  getBoards(@CurrentUser() userId: string) {
    return this.boardService.findBoards(userId);
  }

  @Post("")
  @UseGuards(BannedUserGuard)
  createBoard(@CurrentUser() userId: string, @Body() body: CreateBoardDto) {
    return this.boardService.createBoard(userId, body);
  }

  @Patch(":id")
  @UseGuards(BannedUserGuard)
  updateBoard(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() body: UpdateBoardDto
  ) {
    return this.boardService.updateBoard(userId, id, body);
  }

  @Delete("id")
  @UseGuards(BannedUserGuard)
  removeBoard(@CurrentUser() userId: string, @Param("id") id: string) {
    return this.boardService.deleteBoard(userId, id);
  }

  @Post(":boardId/column")
  @UseGuards(BannedUserGuard)
  createColumn(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Body() body: CreateColumnDto
  ) {
    return this.boardService.createColumn(userId, boardId, body);
  }

  @Patch(":boardId/column/:columnId")
  @UseGuards(BannedUserGuard)
  updateColumn(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Body() body: UpdateColumnDto
  ) {
    return this.boardService.updateColumn(userId, boardId, columnId, body);
  }

  @Delete(":boardId/column/:columnId")
  @UseGuards(BannedUserGuard)
  removeColumn(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string
  ) {
    return this.boardService.deleteColumn(userId, boardId, columnId);
  }

  @Post(":boardId/column/:columnId/task")
  @UseGuards(BannedUserGuard)
  createTask(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Body() body: CreateTaskDto
  ) {
    return this.boardService.createTask(userId, boardId, columnId, body);
  }

  @Patch(":boardId/column/:columnId/task/:taskId")
  @UseGuards(BannedUserGuard)
  updateTask(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Param("taskId") taskId: string,
    @Body() body: UpdateTaskDto
  ) {
    return this.boardService.updateTask(
      userId,
      boardId,
      columnId,
      taskId,
      body
    );
  }

  @Delete(":boardId/column/:columnId/task/:taskId")
  @UseGuards(BannedUserGuard)
  removeTask(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("columnId") columnId: string,
    @Param("taskId") taskId: string
  ) {
    return this.boardService.deleteTask(userId, boardId, columnId, taskId);
  }

  @Post(":boardId/tag")
  @UseGuards(BannedUserGuard)
  createTag(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Body() body: CreateTagDto
  ) {
    return this.boardService.createTag(userId, boardId, body);
  }

  @Patch(":boardId/tag/:tagId")
  @UseGuards(BannedUserGuard)
  updateTag(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("tagId") tagId: string,
    @Body() body: UpdateTagDto
  ) {
    return this.boardService.updateTag(userId, boardId, tagId, body);
  }

  @Delete(":boardId/tag/:tagId")
  @UseGuards(BannedUserGuard)
  removeTag(
    @CurrentUser() userId: string,
    @Param("boardId") boardId: string,
    @Param("tagId") tagId: string
  ) {
    return this.boardService.deleteTag(userId, boardId, tagId);
  }
}
