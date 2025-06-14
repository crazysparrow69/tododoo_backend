import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { NotificationService } from "./../notification/notification.service";
import {
  CreateSubtaskDto,
  CreateTaskDto,
  QueryTaskDto,
  SubtaskAssignedDto,
  SubtaskResponseDto,
  TaskResponseDto,
  UpdateTaskDto,
} from "./dtos";
import { SubtaskService } from "./subtask.service";
import { TaskService } from "./task.service";
import { UserTasksStats } from "./types";
import { CurrentUser } from "../auth/decorators";
import { AuthGuard, BannedUserGuard } from "../auth/guards";
import { WithPagination } from "src/common/interfaces";

@Controller("task")
@UseGuards(AuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly subtaskService: SubtaskService,
    private readonly notificationService: NotificationService
  ) {}

  @Get(":id")
  getTask(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<TaskResponseDto> {
    return this.taskService.findOne(userId, id);
  }

  @Get("")
  async getTasks(
    @CurrentUser() userId: string,
    @Query() query: QueryTaskDto
  ): Promise<WithPagination<TaskResponseDto | SubtaskResponseDto>> {
    const { page = 1, limit = 10, ...queryParams } = query;

    const foundTasks = (await this.taskService.findByQuery(
      userId,
      queryParams
    )) as TaskResponseDto[];
    const foundSubtasks = (await this.subtaskService.findByQuery(
      userId,
      queryParams
    )) as SubtaskResponseDto[];

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

    return { results: tasks, page, totalPages };
  }

  @Post("")
  @UseGuards(BannedUserGuard)
  createTask(
    @CurrentUser() userId: string,
    @Body() body: CreateTaskDto
  ): Promise<TaskResponseDto> {
    return this.taskService.create(userId, body);
  }

  @Patch(":id")
  @UseGuards(BannedUserGuard)
  updateTask(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() body: UpdateTaskDto
  ): Promise<TaskResponseDto> {
    return this.taskService.update(userId, id, body);
  }

  @Delete(":id")
  @UseGuards(BannedUserGuard)
  removeTask(@CurrentUser() userId: string, @Param("id") id: string) {
    return this.taskService.remove(userId, id);
  }

  @Post("stats")
  getStats(@CurrentUser() userId: string): Promise<UserTasksStats[]> {
    return this.taskService.getStats(userId);
  }

  @Post(":taskId/subtask")
  @UseGuards(BannedUserGuard)
  async createSubtask(
    @CurrentUser() userId: string,
    @Param("taskId") taskId: string,
    @Body() body: CreateSubtaskDto
  ): Promise<SubtaskAssignedDto> {
    const createdSubtask = await this.subtaskService.create(
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
}
