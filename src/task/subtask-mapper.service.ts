import { Injectable } from "@nestjs/common";

import { SubtaskAssignedDto, SubtaskFullDto } from "./dtos/response";
import { SubtaskResponseDto } from "./dtos/response/subtask-response.dto";
import { Subtask } from "./schemas";
import { TaskTypes } from "./types";
import { CategoryMapperService } from "../category/category-mapper.service";

@Injectable()
export class SubtaskMapperService {
  constructor(private readonly categoryMapperService: CategoryMapperService) {}
  toSubtaskResponse(subtask: Subtask): SubtaskResponseDto {
    return {
      _id: subtask._id.toString(),
      title: subtask.title,
      description: subtask.description,
      isCompleted: subtask.isCompleted,
      categories: this.categoryMapperService.toCategories(subtask.categories),
      links: subtask.links,
      creator:
        subtask.assigneeId._id.toString() !== subtask.userId.toString()
          ? {
              _id: subtask.userId._id.toString(),
              username: subtask.userId.username,
              avatar: subtask.userId.avatarId?.url ?? "",
            }
          : null,
      dateOfCompletion: subtask.dateOfCompletion || null,
      deadline: subtask.deadline || null,
      type: TaskTypes.SUBTASK,
    };
  }

  toSubtasks(subtasks: Subtask[]): SubtaskResponseDto[] {
    const result: SubtaskResponseDto[] = [];

    for (const subtask of subtasks) {
      const mappedSubtask = this.toSubtaskResponse(subtask);
      result.push(mappedSubtask);
    }

    return result;
  }

  toAssignedSubtask(subtask: Subtask): SubtaskAssignedDto {
    return {
      _id: subtask._id.toString(),
      title: subtask.title,
      description: subtask.description,
      isCompleted: subtask.isCompleted,
      isConfirmed: subtask.isConfirmed,
      isRejected: subtask.isRejected,
      links: subtask.links,
      assignee: {
        _id: subtask.assigneeId._id.toString(),
        username: subtask.assigneeId.username,
        avatar: subtask.assigneeId.avatarId?.url ?? "",
      },
      dateOfCompletion: subtask.dateOfCompletion || null,
      deadline: subtask.deadline || null,
    };
  }

  toAssignedSubtasks(subtasks: Subtask[]): SubtaskAssignedDto[] {
    const result: SubtaskAssignedDto[] = [];

    for (const subtask of subtasks) {
      const mappedSubtask = this.toAssignedSubtask(subtask);
      result.push(mappedSubtask);
    }

    return result;
  }

  toFullSubtask(subtask: Subtask): SubtaskFullDto {
    return {
      _id: subtask._id.toString(),
      title: subtask.title,
      description: subtask.description,
      isCompleted: subtask.isCompleted,
      isConfirmed: subtask.isConfirmed,
      isRejected: subtask.isRejected,
      categories: this.categoryMapperService.toCategories(subtask.categories),
      links: subtask.links,
      creator:
        subtask.assigneeId._id.toString() !== subtask.userId.toString()
          ? {
              _id: subtask.userId._id.toString(),
              username: subtask.userId.username,
              avatar: subtask.userId.avatarId?.url ?? "",
            }
          : null,
      assignee: {
        _id: subtask.assigneeId._id.toString(),
        username: subtask.assigneeId.username,
        avatar: subtask.assigneeId.avatarId?.url ?? "",
      },
      dateOfCompletion: subtask.dateOfCompletion || null,
      deadline: subtask.deadline || null,
      type: TaskTypes.SUBTASK,
    };
  }
}
