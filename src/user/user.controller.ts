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
} from '@nestjs/common';

import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';
import { SigninUserDto } from './dtos/signin-user.dto';
import { UpdateUserPipe } from './pipes/update-user.pipe';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  getUser(@Request() req): any {
    return this.userService.findOne(req.user.sub);
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

  @UseGuards(AuthGuard)
  @Patch('/')
  updateUser(@Request() req, @Body(UpdateUserPipe) body: UpdateUserDto): any {
    return this.userService.update(req.user.sub, body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string): any {
    return this.userService.remove(id);
  }
}
