import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { AuthGuard } from "../auth/guards/auth.guard";
import { ImageService } from "./image.service";
import { CurrentUser } from "../decorators/current-user.decorator";

@UseGuards(AuthGuard)
@Controller("image")
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post("/avatar")
  @UseInterceptors(FileInterceptor("image"))
  async createAvatar(@CurrentUser() userId: string, @UploadedFile() file: any) {
    return this.imageService.uploadAvatar(userId, file);
  }
}
