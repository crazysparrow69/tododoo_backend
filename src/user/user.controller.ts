import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";

import {
  ChangePasswordDto,
  QueryUserDto,
  UpdateUserDto,
  UserBaseDto,
  UserProfileDto,
} from "./dtos";
import { UserService } from "./user.service";
import { CurrentUser } from "../auth/decorators";
import { AuthGuard, BannedUserGuard } from "../auth/guards";
import { ApiResponseStatus, WithPagination } from "src/common/interfaces";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("me")
  @UseGuards(AuthGuard)
  getUserProfile(@Request() req): Promise<UserProfileDto> {
    return this.userService.getUserProfile(req.user.sub);
  }

  @Get("profile/:id")
  @UseGuards(AuthGuard)
  getUserPublicProfile(@Param("id") userId: string): Promise<UserBaseDto> {
    return this.userService.getUserPublicProfile(userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  getUsers(@Query() query: QueryUserDto): Promise<WithPagination<UserBaseDto>> {
    return this.userService.findUsersByUsername(query);
  }

  @Patch()
  @UseGuards(BannedUserGuard)
  @UseGuards(AuthGuard)
  updateUser(
    @CurrentUser() userId: string,
    @Body() body: UpdateUserDto
  ): Promise<UserProfileDto> {
    return this.userService.update(userId, body);
  }

  @Delete()
  @UseGuards(BannedUserGuard)
  @UseGuards(AuthGuard)
  removeUser(@CurrentUser() userId: string): Promise<ApiResponseStatus> {
    return this.userService.remove(userId);
  }

  @Post("password")
  @UseGuards(BannedUserGuard)
  @UseGuards(AuthGuard)
  changePassword(
    @CurrentUser() userId: string,
    @Body() passwords: ChangePasswordDto
  ): Promise<ApiResponseStatus> {
    return this.userService.changePassword(userId, passwords);
  }
}
