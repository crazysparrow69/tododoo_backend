import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Types } from "mongoose";

import { NotificationService } from "./../notification/notification.service";
import {
  CreateSubtaskDto,
  CreateTaskDto,
  QueryTaskDto,
  TaskResponseDto,
  UpdateSubtaskDto,
  UpdateTaskDto,
} from "./dtos";
import { Subtask } from "./schemas";
import { TaskService } from "./task.service";
import { UserTasksStats } from "./types";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CurrentUser } from "../decorators/current-user.decorator";

@Controller("task")
@UseGuards(AuthGuard)
export class TaskController {
  constructor(
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {}

  @Get(":id")
  getTask(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<TaskResponseDto> {
    return this.taskService.findOne(userId, id);
  }

  @Get("")
  async getTasks(@CurrentUser() userId: string, @Query() query: QueryTaskDto) {
    const { page = 1, limit = 10, ...queryParams } = query;

    const foundTasks = (await this.taskService.findByQuery(
      userId,
      queryParams as QueryTaskDto
    )) as TaskResponseDto[];

    const foundSubtasks = (await this.taskService.findSubtasksByQuery(
      userId,
      queryParams as QueryTaskDto
    )) as Subtask[];

    const tasks = [...foundTasks, ...foundSubtasks]
      .sort((a, b) => {
        const deadlineA = a.deadline
          ? new Date(a.deadline).getTime()
          : Infinity;
        const deadlineB = b.deadline
          ? new Date(b.deadline).getTime()
          : Infinity;

        return deadlineA - deadlineB;
      })
      .slice((page - 1) * limit, page * limit);

    const totalPages = Math.ceil(
      (foundTasks.length + foundSubtasks.length) / limit
    );

    return { tasks, currentPage: page, totalPages };
  }

  @Post("")
  createTask(
    @CurrentUser() userId: string,
    @Body() body: CreateTaskDto
  ): Promise<TaskResponseDto> {
    return this.taskService.create(userId, body);
  }

  @Patch(":id")
  updateTask(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() body: UpdateTaskDto
  ): Promise<TaskResponseDto> {
    return this.taskService.update(userId, id, body);
  }

  @Delete(":id")
  async removeTask(@CurrentUser() userId: string, @Param("id") id: string) {
    const removedTask = await this.taskService.remove(userId, id);
    removedTask.subtasks.forEach((el) =>
      this.notificationService.deleteSubtaskConf(el._id.toString())
    );
    return removedTask;
  }

  @Post("stats")
  getStats(@CurrentUser() userId: string): Promise<UserTasksStats[]> {
    return this.taskService.getStats(userId);
  }

  @Post(":taskId/subtask")
  @HttpCode(HttpStatus.CREATED)
  async createSubtask(
    @CurrentUser() userId: string,
    @Param("taskId") taskId: string,
    @Body() body: CreateSubtaskDto
  ) {
    const createdSubtask = await this.taskService.addSubtask(
      userId,
      taskId,
      body
    );

    if (userId.toString() !== body.assigneeId.toString()) {
      await this.notificationService.createSubtaskConf(
        { assigneeId: body.assigneeId, subtaskId: createdSubtask._id },
        userId
      );
    }

    return createdSubtask;
  }

  @Patch("subtask/:id")
  updateSubtask(
    @CurrentUser() userId: Types.ObjectId,
    @Param("id") id: string,
    @Body() body: UpdateSubtaskDto
  ) {
    return this.taskService.updateSubtask(userId, id, body);
  }

  @Delete("subtask/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSubtask(
    @CurrentUser() userId: Types.ObjectId,
    @Param("id") id: string
  ) {
    const removedSubtask = await this.taskService.removeSubtask(userId, id);
    const assigneeId = removedSubtask.assigneeId;
    if (
      userId !== assigneeId &&
      !removedSubtask.isConfirmed &&
      !removedSubtask.rejected
    ) {
      await this.notificationService.deleteSubtaskConf(id);
    }
    return removedSubtask;
  }
}
