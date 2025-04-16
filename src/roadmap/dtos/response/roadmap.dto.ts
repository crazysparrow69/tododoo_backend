import { UserReference } from "src/common/interfaces";
import { RoadmapCategoryResponseDto } from "./roadmap-category.dto";

export class RoadmapResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  members: UserReference[];
  quarters: any[];
  milestones: any[];
  categories: RoadmapCategoryResponseDto[];
  updatedAt: Date;
}
