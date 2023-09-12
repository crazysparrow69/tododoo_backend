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
  Response,
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

  @Get('/me')
  @UseGuards(AuthGuard)
  getUser(@Request() req) {
    return this.userService.findOne(req.user.sub);
  }

  //Make this route to show only basic info about users
  @Get('/')
  getUsers(@Query() query: QueryUserDto) {
    return this.userService.find(query);
  }

  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }

  @Post('/signin')
  signIn(@Body() body: SigninUserDto) {
    return this.authService.signin(body.email, body.password);
  }

  @Patch('/')
  @UseGuards(AuthGuard)
  updateUser(@Request() req, @Body(UpdateUserPipe) body: UpdateUserDto) {
    return this.userService.update(req.user.sub, body);
  }

  @Delete('/')
  @UseGuards(AuthGuard)
  removeUser(@Request() req, @Response() res) {
    this.userService.remove(req.user.sub);

    return res.sendStatus(204);
  }
}
