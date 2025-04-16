import { RoadmapCategoryRowResponseDto } from "./roadmap-category-row.dto";

export class RoadmapCategoryResponseDto {
  _id: string;
  title: string;
  color: string;
  rows: RoadmapCategoryRowResponseDto[];
}
