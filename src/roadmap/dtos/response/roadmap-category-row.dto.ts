import { RoadmapTaskResponseDto } from "./roadmap-task.dto";

export class RoadmapCategoryRowResponseDto {
  _id: string;
  tasks: RoadmapTaskResponseDto[];
}
