import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";

import { UserRoles } from "../user/user.schema";
import { UserService } from "../user/user.service";

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async updateUserBanStatus(
    userId: string,
    isBanned: boolean
  ): Promise<{ success: boolean }> {
    const foundUser = (
      await this.userService.find(
        { _id: new Types.ObjectId(userId) },
        { roles: 1 }
      )
    )[0];
    if (foundUser.roles.includes(UserRoles.ADMIN)) {
      throw new BadRequestException("You cannot ban another admin");
    }

    await this.userService.update(userId, { isBanned });

    return { success: true };
  }
}
