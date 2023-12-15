import { Controller, Get, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { NotificationService } from 'src/notification/notification.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/')
  getAllNotifications(@CurrentUser() userId: Types.ObjectId) {
    return this.notificationService.getAllNotifications(userId);
  }
}
