import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import {
  ChangePasswordDto,
  CreateUserDto,
  QueryUserDto,
  SigninUserDto,
  UpdateUserDto,
} from "./dtos";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CurrentUser } from "../decorators/current-user.decorator";

@Controller("user")
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  @Get("/me")
  @UseGuards(AuthGuard)
  getUser(@Request() req) {
    return this.userService.findOne(req.user.sub);
  }

  @Get("/")
  @UseGuards(AuthGuard)
  getUsers(@Query() query: QueryUserDto) {
    return this.userService.findUsersByUsername(query);
  }

  @Post("/signup")
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }

  @Post("/signin")
  signIn(@Body() body: SigninUserDto) {
    return this.authService.signin(body.email, body.password);
  }

  @Patch("/")
  @UseGuards(AuthGuard)
  updateUser(@CurrentUser() userId: string, @Body() body: UpdateUserDto) {
    return this.userService.update(userId, body);
  }

  @Delete("/")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(@CurrentUser() userId: string) {
    return this.userService.remove(userId);
  }

  @Post("/password")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() userId: string,
    @Body() passwords: ChangePasswordDto
  ) {
    return this.userService.changePassword(userId, passwords);
  }
}
