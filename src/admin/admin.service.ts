import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async updateUserBanStatus(
    userId: string,
    isBanned: boolean
  ): Promise<{ success: boolean }> {
    await this.userService.update(userId, { isBanned });

    return { success: true };
  }
}
