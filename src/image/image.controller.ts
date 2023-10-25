import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { ImageService } from './image.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard)
@Controller('image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('/avatar')
  @UseInterceptors(FileInterceptor('image'))
  async createAvatar(@CurrentUser() userId: string, @UploadedFile() file: any) {
    return this.imageService.uploadAvatar(userId, file);
  }
}
