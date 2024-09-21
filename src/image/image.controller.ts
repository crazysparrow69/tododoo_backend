import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { ImageService } from "./image.service";
import { CurrentUser } from "../auth/decorators";
import { AuthGuard, BannedUserGuard } from "../auth/guards";

@UseGuards(AuthGuard)
@Controller("image")
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post("/avatar")
  @UseGuards(BannedUserGuard)
  @UseInterceptors(FileInterceptor("image"))
  async createAvatar(@CurrentUser() userId: string, @UploadedFile() file: any) {
    return this.imageService.uploadAvatar(userId, file);
  }
}
