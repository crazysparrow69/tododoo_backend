import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('/:id')
  getTask(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Get('/')
  getTasks() {}

  @Post('/')
  createTask(@Body() body: CreateTaskDto) {
    return this.taskService.create(body);
  }

  @Patch('/:id')
  updateTask(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    return this.taskService.update(id, body);
  }

  @Delete('/:id')
  removeTask(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
