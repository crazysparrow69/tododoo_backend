import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers(@Param('email') email: string): any {
    return this.userService.find(email);
  }

  @Get('/:id')
  findUser(@Param('id') id: string): any {
    return this.userService.findOne(parseInt(id));
  }

  @Post('/signup')
  createUser(@Body() body: CreateUserDto): any {
    return this.userService.create(
      body.username,
      body.password,
      body.email,
      body.avatar,
    );
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto): any {}

  @Delete('/:id')
  removeUser(@Param('id') id: string): any {
    return this.userService.remove(parseInt(id));
  }
}
