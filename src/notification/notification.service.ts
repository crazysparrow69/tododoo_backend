import { Injectable } from '@nestjs/common';

import { SubtaskConfirmService } from 'src/confirmation/subtask-confirmation.service';
import { CreateSubtaskConfirmationDto } from 'src/confirmation/dtos/create-subtask-confirmation.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private subtaskConfirmService: SubtaskConfirmService,
    private notificationGateway: NotificationGateway,
  ) {}

  async createSubtaskConf(dto: CreateSubtaskConfirmationDto, userId: string) {
    const createdSubtConf =
      await this.subtaskConfirmService.createSubtaskConfirmation(userId, dto);

    const socketId = this.notificationGateway.findConnectionByUserId(
      dto.assigneeId,
    );
    if (socketId) {
      this.notificationGateway.io
        .to(socketId)
        .emit('newSubtaskConfirmation', createdSubtConf);
    }
  }

  async getAllNotifications(userId: string) {
    const foundSubtaskConf =
      await this.subtaskConfirmService.getSubtaskConfirmations(userId);

    const notifications = [...foundSubtaskConf].sort((a, b) => {
      const createdAtA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : Infinity;
      const createdAtB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : Infinity;

      return createdAtA - createdAtB;
    });

    return notifications;
  }

  async deleteSubtaskConf(userId: string, subtaskId: string) {
    const deletedSubtConf =
      await this.subtaskConfirmService.removeSubtaskConfirmation(subtaskId);

    const socketId = this.notificationGateway.findConnectionByUserId(
      deletedSubtConf.assigneeId.toString(),
    );
    if (socketId) {
      this.notificationGateway.io
        .to(socketId)
        .emit('delSubtaskConfirmation', deletedSubtConf._id);
    }
  }
}
