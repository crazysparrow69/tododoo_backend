import { Controller, Get, UseGuards } from '@nestjs/common';

import { NotificationService } from 'src/notification/notification.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Types } from 'mongoose';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/')
  getAllNotifications(@CurrentUser() userId: Types.ObjectId) {
    return this.notificationService.getAllNotifications(userId);
  }
}
