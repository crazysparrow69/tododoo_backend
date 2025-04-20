import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { UpdateNotificationDto } from "./dtos";
import { CreateNotificationDto } from "./dtos/create-notification.dto";
import { NotificationResponseDto } from "./dtos/response/notification-response.dto";
import { NotificationMapperService } from "./notification-mapper.service";
import { NotificationGateway } from "./notification.gateway";
import { Notification } from "./notification.schema";
import { NotificationServerEvents } from "./types";
import { CreateSubtaskConfirmationDto } from "../confirmation/dtos/create-subtask-confirmation.dto";
import { SubtaskConfirmation } from "../confirmation/subtask-confirmation.schema";
import { SubtaskConfirmService } from "../confirmation/subtask-confirmation.service";
import { getUserReferencePopulate } from "src/user/user.populate";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @Inject(forwardRef(() => NotificationGateway))
    private notificationGateway: NotificationGateway,
    private subtaskConfirmService: SubtaskConfirmService,
    private readonly notificationMapperService: NotificationMapperService
  ) {}

  async createSubtaskConf(
    dto: CreateSubtaskConfirmationDto,
    userId: string
  ): Promise<void> {
    const createdSubtConf =
      await this.subtaskConfirmService.createSubtaskConfirmation(userId, dto);

    if (createdSubtConf) {
      const socketId = this.notificationGateway.findConnectionByUserId(
        dto.assigneeId
      );
      if (socketId) {
        this.notificationGateway.io
          .to(socketId)
          .emit(NotificationServerEvents.NEW_SUBTASK_CONFIRMATION, {
            _id: createdSubtConf._id.toString(),
            creator: {
              _id: createdSubtConf.userId._id.toString(),
              username: (createdSubtConf.userId as any).username,
              avatar: (createdSubtConf.userId as any)?.avatar?.url || "",
            },
            assigneeId: createdSubtConf.assigneeId.toString(),
            subtaskId: createdSubtConf.subtaskId,
            type: createdSubtConf.type,
            createdAt: createdSubtConf.createdAt,
          });
      }
    }
  }

  async getAllNotifications(
    userId: Types.ObjectId,
    page: number,
    limit: number,
    skip: number
  ): Promise<{
    notifications: Array<SubtaskConfirmation | NotificationResponseDto>;
    currentPage: number;
    totalPages: number;
  }> {
    const foundSubtaskConf =
      await this.subtaskConfirmService.getSubtaskConfirmations(userId);
    const foundNotifications = await this.notificationModel
      .find({ userId, isRead: false })
      .populate(["subtaskId", getUserReferencePopulate("actionByUserId")]);
    const mappedNotifications =
      this.notificationMapperService.toNotifications(foundNotifications);

    const notifications = [...foundSubtaskConf, ...mappedNotifications].sort(
      (a, b) => {
        const createdAtA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : Infinity;
        const createdAtB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : Infinity;

        return createdAtB - createdAtA;
      }
    );

    const totalPages = Math.ceil(notifications.length / limit);

    const notificationsSlice = notifications.slice(
      (page - 1) * limit + skip,
      page * limit + skip
    );

    return { notifications: notificationsSlice, currentPage: page, totalPages };
  }

  async deleteSubtaskConf(subtaskId: string): Promise<void> {
    const deletedSubtConf =
      await this.subtaskConfirmService.removeSubtaskConfirmation(subtaskId);

    if (deletedSubtConf) {
      const socketId = this.notificationGateway.findConnectionByUserId(
        deletedSubtConf.assigneeId.toString()
      );
      if (socketId) {
        this.notificationGateway.io
          .to(socketId)
          .emit(
            NotificationServerEvents.DEL_SUBTASK_CONFIRMATION,
            deletedSubtConf._id
          );
      }
    }
  }

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const createdNotification = await this.notificationModel.create(dto);
    await createdNotification.populate([getUserReferencePopulate("actionByUserId"), "subtaskId"]);

    return this.notificationMapperService.toNotificationResponse(
      createdNotification
    );
  }

  async update(
    userId: Types.ObjectId,
    notificationId: string,
    updateNotificationDto: UpdateNotificationDto
  ): Promise<{ success: true }> {
    const foundNotification = await this.notificationModel.findOne({
      _id: notificationId,
      userId,
    });
    if (!foundNotification) {
      throw new NotFoundException("Notification not found");
    }

    Object.assign(foundNotification, updateNotificationDto);
    await foundNotification.save();

    return { success: true };
  }
}
