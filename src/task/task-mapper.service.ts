import { Injectable } from "@nestjs/common";
import { CategoryMapperService } from "src/category/category-mapper.service";

import { TaskResponseDto } from "./dtos";
import { Task } from "./schemas";

@Injectable()
export class TaskMapperService {
  constructor(private readonly categoryMapperService: CategoryMapperService) {}
  toTaskResponse(task: Task): TaskResponseDto {
    return {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      categories: this.categoryMapperService.toCategories(task.categories),
      links: task.links,
      subtasks: task.subtasks,
      dateOfCompletion: task.dateOfCompletion || null,
      deadline: task.deadline || null,
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
