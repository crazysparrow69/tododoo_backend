import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { Types } from 'mongoose';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { NotificationService } from 'src/notification/notification.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/')
  getAllNotifications(@CurrentUser() userId: Types.ObjectId, @Query() query: any) {
    const { page = 1, limit = 10 } = query;
    return this.notificationService.getAllNotifications(userId, page, limit);
  }
}
