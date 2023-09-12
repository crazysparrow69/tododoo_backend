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
  Request,
  Response
} from '@nestjs/common';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { QueryTaskDto } from './dtos/query-task.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateTaskPipe } from './pipes/update-task.pipe';

@Controller('task')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('/:id')
  getTask(@Request() req, @Param('id') id: string) {
    return this.taskService.findOne(req.user.sub, id);
  }

  @Get('/')
  getTasks(@Request() req, @Query() query: QueryTaskDto) {
    return this.taskService.find(req.user.sub, query);
  }

  @Post('/')
  createTask(@Request() req, @Body() body: CreateTaskDto) {
    return this.taskService.create(req.user.sub, body);
  }

  @Patch('/:id')
  updateTask(
    @Request() req,
    @Param('id') id: string,
    @Body(UpdateTaskPipe) body: UpdateTaskDto,
  ) {
    return this.taskService.update(req.user.sub, id, body);
  }

  @Delete('/:id')
  removeTask(@Request() req, @Response() res, @Param('id') id: string) {
    this.taskService.remove(req.user.sub, id);
    
    return res.sendStatus(204);
  }
}
