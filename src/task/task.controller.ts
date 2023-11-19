import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { QueryTaskDto } from './dtos/query-task.dto';
import { CreateSubtaskDto } from './dtos/create-subtask.dto';
import { UpdateSubtaskDto } from './dtos/update-subtask.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Task } from './task.schema';
import { Subtask } from './subtask.schema';

@Controller('task')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('/:id')
  getTask(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.taskService.findOne(userId, id);
  }

  @Get('/')
  async getTasks(@CurrentUser() userId: string, @Query() query: QueryTaskDto) {
    const { page = 1, limit = 10, ...queryParams } = query;

    const foundTasks = (await this.taskService.findTasksByQuery(
      userId,
      queryParams as QueryTaskDto,
    )) as Task[];

    const foundSubtasks = (await this.taskService.findSubtasksByQuery(
      userId,
      queryParams as QueryTaskDto,
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
      (foundTasks.length + foundSubtasks.length) / limit,
    );

    return { tasks, currentPage: page, totalPages };
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  createTask(@CurrentUser() userId: string, @Body() body: CreateTaskDto) {
    return this.taskService.createTask(userId, body);
  }

  @Patch('/:id')
  updateTask(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(userId, id, body);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTask(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.taskService.removeTask(userId, id);
  }

  @Post('/stats')
  getStats(@CurrentUser() userId: string) {
    return this.taskService.getStats(userId);
  }

  @Post('/:taskId/subtask')
  createSubtask(
    @CurrentUser() userId: string,
    @Param('taskId') taskId: string,
    @Body() body: CreateSubtaskDto,
  ) {
    return this.taskService.addSubtask(userId, taskId, body);
  }

  @Patch('/subtask/:id')
  updateSubtask(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: UpdateSubtaskDto,
  ) {
    return this.taskService.updateSubtask(userId, id, body);
  }

  @Delete('/subtask/:id')
  removeSubtask(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.taskService.removeSubtask(userId, id);
  }
} 
