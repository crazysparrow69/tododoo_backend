import { Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";

import { AdminService } from "./admin.service";
import { UpdateUserBanStatusDto } from "./dtos";
import { AdminGuard } from "../auth/guards";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch("user/:id/banStatus")
  updateUserBanStatus(
    @Param("id") id: string,
    @Body() body: UpdateUserBanStatusDto
  ) {
    return this.adminService.updateUserBanStatus(id, body.isBanned);
  }
}
