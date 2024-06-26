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
import { AuthGuard } from "../auth/guards/auth.guard";
import { CurrentUser } from "../decorators/current-user.decorator";

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
  getUsers(@Query() query: QueryUserDto): Promise<{
    foundUsers: UserBaseDto[];
    page: number;
    totalPages: number;
  }> {
    return this.userService.findUsersByUsername(query);
  }

  @Patch()
  @UseGuards(AuthGuard)
  updateUser(
    @CurrentUser() userId: string,
    @Body() body: UpdateUserDto
  ): Promise<UserProfileDto> {
    return this.userService.update(userId, body);
  }

  @Delete()
  @UseGuards(AuthGuard)
  removeUser(@CurrentUser() userId: string): Promise<{ success: boolean }> {
    return this.userService.remove(userId);
  }

  @Post("password")
  @UseGuards(AuthGuard)
  changePassword(
    @CurrentUser() userId: string,
    @Body() passwords: ChangePasswordDto
  ): Promise<{ success: boolean }> {
    return this.userService.changePassword(userId, passwords);
  }
}
