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

import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';
import { SigninUserDto } from './dtos/signin-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('/:id')
  getUser(@Param('id') id: string): any {
    return this.userService.findOne(id);
  }

  @Get('/')
  getUsers(@Query() query: QueryUserDto): any {
    return this.userService.find(query);
  }

  @Post('/signup')
  createUser(@Body() body: CreateUserDto): any {
    return this.authService.signup(body);
  }

  @Post('/signin')
  signIn(@Body() body: SigninUserDto) {
    return this.authService.signin(body.email, body.password);
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
