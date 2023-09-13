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
  Response,
} from '@nestjs/common';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { QueryTaskDto } from './dtos/query-task.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateTaskPipe } from './pipes/update-task.pipe';
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
  createTask(@CurrentUser() userId: string, @Body() body: CreateTaskDto) {
    return this.taskService.create(userId, body);
  }

  @Patch('/:id')
  updateTask(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body(UpdateTaskPipe) body: UpdateTaskDto,
  ) {
    return this.taskService.update(userId, id, body);
  }

  @Delete('/:id')
  removeTask(
    @CurrentUser() userId: string,
    @Response() res,
    @Param('id') id: string,
  ) {
    this.taskService.remove(userId, id);

    return res.sendStatus(204);
  }
}
