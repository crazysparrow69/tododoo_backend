import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:id')
  findUser(@Param('id') id: string): any {
    return this.userService.findOne(id);
  }

  @Get('/')
  getUsers(@Query() query: QueryUserDto): any {
    return this.userService.find(query);
  }

  @Post('/signup')
  createUser(@Body() body: CreateUserDto): any {
    return this.userService.create(body);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto): any {
    return this.userService.update(id, body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string): any {
    return this.userService.remove(id);
  }
}
