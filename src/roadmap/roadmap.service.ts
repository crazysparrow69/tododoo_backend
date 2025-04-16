import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Roadmap, RoadmapDocument } from "./roadmap.schema";
import { RoadmapMapperService } from "./roadmap-mapper.service";
import {
  CreateCategoryDto,
  CreateMilestoneDto,
  CreateQuarterDto,
  CreateRoadmapDto,
  CreateTaskDto,
  RoadmapBaseResponseDto,
  RoadmapCategoryResponseDto,
  RoadmapCategoryRowResponseDto,
  RoadmapMilestoneResponseDto,
  RoadmapQuarterResponseDto,
  RoadmapResponseDto,
  RoadmapTaskResponseDto,
  UpdateCategoryDto,
  UpdateMilestoneDto,
  UpdateQuarterDto,
  UpdateTaskDto,
} from "./dtos";
import { UpdateRoadmapDto } from "./dtos/update-roadmap.dto";
import { ApiResponseStatus } from "src/common/interfaces";

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
  ): Promise<ApiResponseStatus> {
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
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel
      .findOneAndDelete({ _id: roadmapId, userId })
      .lean();
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }

    return { success: true };
  }

  async createCategory(
    userId: string,
    roadmapId: string,
    dto: CreateCategoryDto
  ): Promise<RoadmapCategoryResponseDto> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }

    const newCategory = roadmap.categories.create(dto);

    roadmap.categories.push(newCategory);
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return this.roadmapMapperService.toCategory(newCategory);
  }

  async updateCategory(
    userId: string,
    roadmapId: string,
    categoryId: string,
    dto: UpdateCategoryDto
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({
      _id: roadmapId,
      userId,
    });
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }

    const category = roadmap.categories.id(categoryId);
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    Object.assign(category, dto, { updatedAt: new Date() });
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async deleteCategory(
    userId: string,
    roadmapId: string,
    categoryId: string
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({
      _id: roadmapId,
      userId,
    });
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }

    const category = roadmap.categories.id(categoryId);
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    category.deleteOne();
    category.updatedAt = new Date();
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async createCategoryRow(
    userId: string,
    roadmapId: string,
    categoryId: string
  ): Promise<RoadmapCategoryRowResponseDto> {
    const roadmap = await this.roadmapModel.findOne({
      _id: roadmapId,
      userId,
    });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const category = roadmap.categories.id(categoryId);
    if (!category) throw new NotFoundException("Category not found");

    const newRow = category.rows.create({});

    category.rows.push(newRow);
    category.updatedAt = new Date();
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return this.roadmapMapperService.toCategoryRow(newRow);
  }

  async deleteCategoryRow(
    userId: string,
    roadmapId: string,
    categoryId: string,
    rowId: string
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({
      _id: roadmapId,
      userId,
    });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const category = roadmap.categories.id(categoryId);
    if (!category) throw new NotFoundException("Category not found");

    const row = category.rows.id(rowId);
    if (!row) throw new NotFoundException("Row not found");

    row.deleteOne();
    category.updatedAt = new Date();
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async createTask(
    userId: string,
    roadmapId: string,
    categoryId: string,
    rowId: string,
    dto: CreateTaskDto
  ): Promise<RoadmapTaskResponseDto> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const category = roadmap.categories.id(categoryId);
    if (!category) throw new NotFoundException("Category not found");

    const row = category.rows.id(rowId);
    if (!row) throw new NotFoundException("Row not found");

    const newTask = row.tasks.create(dto);

    row.tasks.push(newTask);
    category.updatedAt = new Date();
    row.updatedAt = new Date();
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return this.roadmapMapperService.toTask(newTask);
  }

  async updateTask(
    userId: string,
    roadmapId: string,
    categoryId: string,
    rowId: string,
    taskId: string,
    dto: UpdateTaskDto
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const category = roadmap.categories.id(categoryId);
    if (!category) throw new NotFoundException("Category not found");

    const row = category.rows.id(rowId);
    if (!row) throw new NotFoundException("Row not found");

    const task = row.tasks.id(taskId);
    if (!task) throw new NotFoundException("Task not found");

    Object.assign(task, dto, { updatedAt: new Date() });
    category.updatedAt = new Date();
    row.updatedAt = new Date();
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async deleteTask(
    userId: string,
    roadmapId: string,
    categoryId: string,
    rowId: string,
    taskId: string
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const category = roadmap.categories.id(categoryId);
    if (!category) throw new NotFoundException("Category not found");

    const row = category.rows.id(rowId);
    if (!row) throw new NotFoundException("Row not found");

    const task = row.tasks.id(taskId);
    if (!task) throw new NotFoundException("Task not found");

    task.deleteOne();
    category.updatedAt = new Date();
    row.updatedAt = new Date();
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async createMilestone(
    userId: string,
    roadmapId: string,
    dto: CreateMilestoneDto
  ): Promise<RoadmapMilestoneResponseDto> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const milestone = roadmap.milestones.create(dto);
    roadmap.milestones.push(milestone);
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return this.roadmapMapperService.toMilestone(milestone);
  }

  async updateMilestone(
    userId: string,
    roadmapId: string,
    milestoneId: string,
    dto: UpdateMilestoneDto
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const milestone = roadmap.milestones.id(milestoneId);
    if (!milestone) throw new NotFoundException("Milestone not found");

    Object.assign(milestone, dto, { updatedAt: new Date() });
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async deleteMilestone(
    userId: string,
    roadmapId: string,
    milestoneId: string
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const milestone = roadmap.milestones.id(milestoneId);
    if (!milestone) throw new NotFoundException("Milestone not found");

    milestone.deleteOne();
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async createQuarter(
    userId: string,
    roadmapId: string,
    dto: CreateQuarterDto
  ): Promise<RoadmapQuarterResponseDto> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const quarter = roadmap.quarters.create(dto);
    roadmap.quarters.push(quarter);
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return this.roadmapMapperService.toQuarter(quarter);
  }

  async updateQuarter(
    userId: string,
    roadmapId: string,
    quarterId: string,
    dto: UpdateQuarterDto
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const quarter = roadmap.quarters.id(quarterId);
    if (!quarter) throw new NotFoundException("Quarter not found");

    Object.assign(quarter, dto, { updatedAt: new Date() });
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async deleteQuarter(
    userId: string,
    roadmapId: string,
    quarterId: string
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const quarter = roadmap.quarters.id(quarterId);
    if (!quarter) throw new NotFoundException("Quarter not found");

    quarter.deleteOne();
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }
}
