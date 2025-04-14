import { UserReference } from "src/common/interfaces";

export class RoadmapResponseDto {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  members: UserReference[];
  quarters: any[];
  milestones: any[];
  categories: any[];
  updatedAt: Date;
}
