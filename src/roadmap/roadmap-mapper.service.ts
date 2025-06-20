import { Injectable } from "@nestjs/common";
import {
  RoadmapResponseDto,
  RoadmapBaseResponseDto,
  RoadmapCategoryResponseDto,
  RoadmapCategoryRowResponseDto,
  RoadmapCategoryRowTaskResponseDto,
  RoadmapMilestoneResponseDto,
  RoadmapQuarterResponseDto,
} from "./dtos";
import { UserMapperService } from "src/user/user-mapper.service";
import { mapDocuments } from "src/common/mapDocuments";
import {
  Roadmap,
  RoadmapCategory,
  RoadmapCategoryRow,
  RoadmapCategoryRowTask,
  RoadmapMilestone,
  RoadmapQuarter,
} from "./roadmap.schema";

@Injectable()
export class RoadmapMapperService {
  constructor(private readonly userMapperService: UserMapperService) {}

  toQuarter(quarter: RoadmapQuarter): RoadmapQuarterResponseDto {
    return {
      _id: quarter._id.toString(),
      title: quarter.title,
      start: quarter.start,
      end: quarter.end,
    };
  }

  toMilestone(milestone: RoadmapMilestone): RoadmapMilestoneResponseDto {
    return {
      _id: milestone._id.toString(),
      title: milestone.title,
      position: milestone.position,
    };
  }

  toTask(task: RoadmapCategoryRowTask): RoadmapCategoryRowTaskResponseDto {
    return {
      _id: task._id.toString(),
      title: task.title,
      progress: task.progress,
      start: task.start,
      end: task.end,
    };
  }

  toCategoryRow(row: RoadmapCategoryRow): RoadmapCategoryRowResponseDto {
    return {
      _id: row._id.toString(),
      tasks: this.toTasks(row.tasks),
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
      quarters: this.toQuarters(roadmap.quarters),
      milestones: this.toMilestones(roadmap.milestones),
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

  toQuarters(quarters: RoadmapQuarter[]): RoadmapQuarterResponseDto[] {
    return mapDocuments<RoadmapQuarter, RoadmapQuarterResponseDto>(
      quarters,
      this.toQuarter.bind(this)
    );
  }

  toMilestones(milestones: RoadmapMilestone[]): RoadmapMilestoneResponseDto[] {
    return mapDocuments<RoadmapMilestone, RoadmapMilestoneResponseDto>(
      milestones,
      this.toMilestone.bind(this)
    );
  }

  toTasks(
    tasks: RoadmapCategoryRowTask[]
  ): RoadmapCategoryRowTaskResponseDto[] {
    return mapDocuments<
      RoadmapCategoryRowTask,
      RoadmapCategoryRowTaskResponseDto
    >(tasks, this.toTask.bind(this));
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
