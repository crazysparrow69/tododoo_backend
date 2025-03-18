import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { UpdateUserBanStatusDto } from "./dtos";
import { AdminGuard } from "../auth/guards";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import 'multer';

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

  @Post("/profile-effect")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "preview", maxCount: 1 },
      { name: "sides", maxCount: 1 },
      { name: "top", maxCount: 1 },
      { name: "intro", maxCount: 1 },
    ])
  )
  async uploadProfileEffect(
    @UploadedFiles()
    files: {
      preview: Express.Multer.File[];
      sides: Express.Multer.File[];
      top?: Express.Multer.File[];
      intro?: Express.Multer.File[];
    },
    @Body("title") title: string
  ) {
    return this.adminService.uploadProfileEffect(title, files);
  }

  @Post("/user-avatar-effect")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "preview", maxCount: 1 },
      { name: "animated", maxCount: 1 },
    ])
  )
  async uploadUserAvatarEffect(
    @UploadedFiles()
    files: {
      preview: Express.Multer.File[];
      animated: Express.Multer.File[];
    },
    @Body("title") title: string
  ) {
    return this.adminService.uploadUserAvatarEffect(title, files);
  }
}
