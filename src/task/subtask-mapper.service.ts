import { Injectable } from "@nestjs/common";
import { SubtaskAssignedDto, SubtaskFullDto } from "./dtos/response";
import { SubtaskResponseDto } from "./dtos/response/subtask-response.dto";
import { Subtask } from "./schemas";
import { TaskTypes } from "./types";
import { CategoryMapperService } from "../category/category-mapper.service";
import { UserMapperService } from "src/user/user-mapper.service";
import { mapDocuments } from "src/common/mapDocuments";

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
      creator:
        subtask.assigneeId._id.toString() !== subtask.userId.toString()
          ? this.userMapperService.toUserReference(subtask.userId)
          : null,
      dateOfCompletion: subtask.dateOfCompletion || null,
      deadline: subtask.deadline || null,
      type: TaskTypes.SUBTASK,
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
      dateOfCompletion: subtask.dateOfCompletion || null,
      deadline: subtask.deadline || null,
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
      dateOfCompletion: subtask.dateOfCompletion || null,
      deadline: subtask.deadline || null,
      type: TaskTypes.SUBTASK,
    };
  }

  toSubtasks(subtasks: Subtask[]): SubtaskResponseDto[] {
    return mapDocuments<Subtask, SubtaskResponseDto>(
      subtasks,
      this.toSubtaskResponse.bind(this)
    );
  }

  toAssignedSubtasks(subtasks: Subtask[]): SubtaskAssignedDto[] {
    return mapDocuments<Subtask, SubtaskAssignedDto>(
      subtasks,
      this.toAssignedSubtask.bind(this)
    );
  }
}
