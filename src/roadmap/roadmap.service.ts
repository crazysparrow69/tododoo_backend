import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Roadmap, RoadmapDocument } from "./roadmap.schema";
import { RoadmapMapperService } from "./roadmap-mapper.service";
import {
  CreateRoadmapDto,
  RoadmapBaseResponseDto,
  RoadmapResponseDto,
} from "./dtos";
import { UpdateRoadmapDto } from "./dtos/update-roadmap.dto";

@Injectable()
export class RoadmapService {
  constructor(
    @InjectModel(Roadmap.name)
    private readonly roadmapModel: Model<RoadmapDocument>,
    private readonly roadmapMapperService: RoadmapMapperService
  ) {}

  async createRoadmap(
    userId: string,
    dto: CreateRoadmapDto
  ): Promise<RoadmapBaseResponseDto> {
    const newRoadmap = new this.roadmapModel({ ...dto, userId });

    newRoadmap.userIds.push(userId as any);

    await newRoadmap.save();

    return this.roadmapMapperService.toBaseRoadmap(newRoadmap);
  }

  async findRoadmaps(userId: string): Promise<RoadmapBaseResponseDto[]> {
    const roadmaps = await this.roadmapModel
      .find(
        { userIds: userId },
        { __v: 0, quarters: 0, milestones: 0, categories: 0, createdAt: 0 }
      )
      .sort({ updatedAt: -1 })
      .lean();

    return this.roadmapMapperService.toBaseRoadmaps(roadmaps);
  }

  async findRoadmap(
    userId: string,
    roadmapId: string
  ): Promise<RoadmapResponseDto> {
    const roadmap = await this.roadmapModel
      .findOne({ _id: roadmapId, userIds: userId })
      .populate([
        {
          path: "userIds",
          select: "_id username avatarId avatarEffectId",
          populate: [
            {
              path: "avatarId",
              select: "-_id url",
            },
            {
              path: "avatarEffectId",
              select: "preview.url animated.url",
            },
          ],
        },
      ])
      .lean();
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }

    return this.roadmapMapperService.toRoadmap(roadmap);
  }

  async updateRoadmap(
    userId: string,
    roadmapId: string,
    dto: UpdateRoadmapDto
  ): Promise<{ success: boolean }> {
    const roadmap = await this.roadmapModel
      .findOneAndUpdate(
        { _id: roadmapId, userId },
        { ...dto, updatedAt: new Date() },
        { new: true }
      )
      .lean();
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }

    return { success: true };
  }

  async deleteRoadmap(
    userId: string,
    roadmapId: string
  ): Promise<{ success: boolean }> {
    const roadmap = await this.roadmapModel
      .findOneAndDelete({ _id: roadmapId, userId })
      .lean();
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }

    return { success: true };
  }
}
