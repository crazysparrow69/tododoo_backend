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
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('task')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('/:id')
  getTask(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.taskService.findOne(userId, id);
  }

  @Get('/')
  getTasks(@CurrentUser() userId: string, @Query() query: QueryTaskDto) {
    return this.taskService.find(userId, query);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  createTask(@CurrentUser() userId: string, @Body() body: CreateTaskDto) {
    return this.taskService.create(userId, body);
  }

  @Patch('/:id')
  updateTask(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ) {
    return this.taskService.update(userId, id, body);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTask(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.taskService.remove(userId, id);
  }

  @Post('/stats')
  getStats(@CurrentUser() userId: string) {
    return this.taskService.getStats(userId);
  }
}
