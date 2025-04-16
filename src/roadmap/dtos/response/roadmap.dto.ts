import { UserReference } from "src/common/interfaces";
import { RoadmapCategoryResponseDto } from "./roadmap-category.dto";
import { RoadmapMilestoneResponseDto } from "./roadmap-milestone.dto";

export class RoadmapResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  members: UserReference[];
  quarters: any[];
  milestones: RoadmapMilestoneResponseDto[];
  categories: RoadmapCategoryResponseDto[];
  updatedAt: Date;
}
