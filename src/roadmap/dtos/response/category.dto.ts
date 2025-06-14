import { RoadmapCategoryRowResponseDto } from "./row.dto";

export class RoadmapCategoryResponseDto {
  _id: string;
  title: string;
  color: string;
  rows: RoadmapCategoryRowResponseDto[];
}
