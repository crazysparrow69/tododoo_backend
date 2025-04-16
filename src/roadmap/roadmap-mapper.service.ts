import { Injectable } from "@nestjs/common";
import {
  RoadmapResponseDto,
  RoadmapBaseResponseDto,
  RoadmapCategoryResponseDto,
  RoadmapCategoryRowResponseDto,
} from "./dtos";
import { UserMapperService } from "src/user/user-mapper.service";
import { mapDocuments } from "src/common/mapDocuments";
import { Roadmap, RoadmapCategory, RoadmapCategoryRow } from "./roadmap.schema";

@Injectable()
export class RoadmapMapperService {
  constructor(private readonly userMapperService: UserMapperService) {}

  toCategoryRow(row: RoadmapCategoryRow): RoadmapCategoryRowResponseDto {
    return {
      _id: row._id.toString(),
      tasks: row.tasks,
    };
  }

  toCategory(category: RoadmapCategory): RoadmapCategoryResponseDto {
    return {
      _id: category._id.toString(),
      title: category.title,
      color: category.color,
      rows: this.toCategoryRows(category.rows),
    };
  }

  toRoadmap(roadmap: Roadmap): RoadmapResponseDto {
    return {
      _id: roadmap._id.toString(),
      title: roadmap.title,
      description: roadmap.description,
      creatorId: roadmap.userId.toString(),
      members: this.userMapperService.toUserReferences(roadmap.userIds),
      quarters: roadmap.quarters,
      milestones: roadmap.milestones,
      categories: this.toCategories(roadmap.categories),
      updatedAt: roadmap.updatedAt,
    };
  }

  toBaseRoadmap(roadmap: Roadmap): RoadmapBaseResponseDto {
    return {
      _id: roadmap._id.toString(),
      title: roadmap.title,
      description: roadmap.description,
      creatorId: roadmap.userId.toString(),
      membersCount: roadmap.userIds.length,
      updatedAt: roadmap.updatedAt,
    };
  }

  toCategoryRows(rows: RoadmapCategoryRow[]): RoadmapCategoryRowResponseDto[] {
    return mapDocuments<RoadmapCategoryRow, RoadmapCategoryRowResponseDto>(
      rows,
      this.toCategoryRow.bind(this)
    );
  }

  toCategories(categories: RoadmapCategory[]): RoadmapCategoryResponseDto[] {
    return mapDocuments<RoadmapCategory, RoadmapCategoryResponseDto>(
      categories,
      this.toCategory.bind(this)
    );
  }

  toRoadmaps(roadmaps: Roadmap[]): RoadmapResponseDto[] {
    return mapDocuments<Roadmap, RoadmapResponseDto>(
      roadmaps,
      this.toRoadmap.bind(this)
    );
  }

  toBaseRoadmaps(roadmaps: Roadmap[]): RoadmapBaseResponseDto[] {
    return mapDocuments<Roadmap, RoadmapBaseResponseDto>(
      roadmaps,
      this.toBaseRoadmap.bind(this)
    );
  }
}
