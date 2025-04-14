import { Injectable } from "@nestjs/common";
import { Roadmap } from "./roadmap.schema";
import { RoadmapResponseDto, RoadmapBaseResponseDto } from "./dtos";
import { UserMapperService } from "src/user/user-mapper.service";
import { mapDocuments } from "src/common/mapDocuments";

@Injectable()
export class RoadmapMapperService {
  constructor(private readonly userMapperService: UserMapperService) {}

  toRoadmap(roadmap: Roadmap): RoadmapResponseDto {
    return {
      _id: roadmap._id.toString(),
      title: roadmap.title,
      description: roadmap.description,
      creatorId: roadmap.userId.toString(),
      members: this.userMapperService.toUserReferences(roadmap.userIds),
      quarters: roadmap.quarters,
      milestones: roadmap.milestones,
      categories: roadmap.categories,
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
