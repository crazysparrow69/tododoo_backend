import { UserReference } from "src/common/interfaces";
import {
  RoadmapCategoryResponseDto,
  RoadmapMilestoneResponseDto,
  RoadmapQuarterResponseDto,
} from "..";

export class RoadmapBaseResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  membersCount: number;
  updatedAt: Date;
}

export class RoadmapResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  members: UserReference[];
  quarters: RoadmapQuarterResponseDto[];
  milestones: RoadmapMilestoneResponseDto[];
  categories: RoadmapCategoryResponseDto[];
  updatedAt: Date;
}
