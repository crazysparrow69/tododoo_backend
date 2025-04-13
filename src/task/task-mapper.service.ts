import { Injectable } from "@nestjs/common";

import { TaskResponseDto } from "./dtos";
import { Task } from "./schemas";
import { SubtaskMapperService } from "./subtask-mapper.service";
import { TaskTypes } from "./types";
import { CategoryMapperService } from "../category/category-mapper.service";
import { mapDocuments } from "src/common/mapDocuments";

@Injectable()
export class TaskMapperService {
  constructor(
    private readonly categoryMapperService: CategoryMapperService,
    private readonly subtaskMapperService: SubtaskMapperService
  ) {}

  toTaskResponse(task: Task): TaskResponseDto {
    return {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      categories: this.categoryMapperService.toCategories(task.categories),
      links: task.links,
      subtasks: this.subtaskMapperService.toAssignedSubtasks(task.subtasks),
      dateOfCompletion: task.dateOfCompletion || null,
      deadline: task.deadline || null,
      type: TaskTypes.TASK,
    };
  }

  toTasks(tasks: Task[]): TaskResponseDto[] {
    return mapDocuments<Task, TaskResponseDto>(
      tasks,
      this.toTaskResponse.bind(this)
    );
  }
}
