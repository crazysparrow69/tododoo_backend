import { Injectable } from "@nestjs/common";
import { Subtask } from "./schemas";
import { TaskTypes } from "./types";
import { CategoryMapperService } from "../category/category-mapper.service";
import { UserMapperService } from "src/user/user-mapper.service";
import { mapDocuments } from "src/common/mapDocuments";
import { SubtaskAssignedDto, SubtaskFullDto, SubtaskResponseDto } from "./dtos";

@Injectable()
export class SubtaskMapperService {
  constructor(
    private readonly categoryMapperService: CategoryMapperService,
    private readonly userMapperService: UserMapperService
  ) {}

  toSubtaskResponse(subtask: Subtask): SubtaskResponseDto {
    return {
      _id: subtask._id.toString(),
      title: subtask.title,
      description: subtask.description,
      isCompleted: subtask.isCompleted,
      categories: this.categoryMapperService.toCategories(subtask.categories),
      links: subtask.links,
      type: TaskTypes.SUBTASK,
      ...(subtask.assigneeId._id.toString() !== subtask.userId.toString()
        ? { creator: this.userMapperService.toUserReference(subtask.userId) }
        : {}),
      ...(subtask.dateOfCompletion
        ? { dateOfCompletion: subtask.dateOfCompletion }
        : {}),
      ...(subtask.deadline ? { deadline: subtask.deadline } : {}),
    };
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
      assignee: this.userMapperService.toUserReference(subtask.assigneeId),
      ...(subtask.dateOfCompletion
        ? { dateOfCompletion: subtask.dateOfCompletion }
        : {}),
      ...(subtask.deadline ? { deadline: subtask.deadline } : {}),
    };
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
      creator: this.userMapperService.toUserReference(subtask.userId),
      assignee: this.userMapperService.toUserReference(subtask.assigneeId),
      type: TaskTypes.SUBTASK,
      ...(subtask.dateOfCompletion
        ? { dateOfCompletion: subtask.dateOfCompletion }
        : {}),
      ...(subtask.deadline ? { deadline: subtask.deadline } : {}),
    };
  }

  toSubtasks(subtasks: Subtask[]): SubtaskResponseDto[] {
    return mapDocuments(subtasks, this.toSubtaskResponse.bind(this));
  }

  toAssignedSubtasks(subtasks: Subtask[]): SubtaskAssignedDto[] {
    return mapDocuments(subtasks, this.toAssignedSubtask.bind(this));
  }
}
