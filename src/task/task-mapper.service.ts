import { Injectable } from "@nestjs/common";
import { CategoryMapperService } from "src/category/category-mapper.service";

import { TaskResponseDto } from "./dtos";
import { Task } from "./schemas";
import { SubtaskMapperService } from "./subtask-mapper.service";
import { TaskTypes } from "./types";

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

  toTasks(tasks: Task[]) {
    const result: TaskResponseDto[] = [];

    for (const task of tasks) {
      const mappedTask = this.toTaskResponse(task);
      result.push(mappedTask);
    }

    return result;
  }
}
