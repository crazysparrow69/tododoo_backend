import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';

import { ImageService } from './image.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateAvatarDto } from './dtos/create-avatar.dto';

@UseGuards(AuthGuard)
@Controller('image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Get('/avatar')
  getAvatar(@CurrentUser() userId: string) {
    return this.imageService.findOneAvatar(userId);
  }

  @Post('/avatar')
  createAvatar(@CurrentUser() userId: string, @Body() body: CreateAvatarDto) {
    return this.imageService.createAvatar(userId, body.image);
  }
}
