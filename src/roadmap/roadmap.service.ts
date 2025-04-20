import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Roadmap, RoadmapDocument } from "./roadmap.schema";
import { RoadmapMapperService } from "./roadmap-mapper.service";
import {
  CreateRoadmapCategoryDto,
  CreateRoadmapMilestoneDto,
  CreateRoadmapQuarterDto,
  CreateRoadmapDto,
  CreateRoadmapCategoryRowTaskDto,
  RoadmapBaseResponseDto,
  RoadmapCategoryResponseDto,
  RoadmapCategoryRowResponseDto,
  RoadmapMilestoneResponseDto,
  RoadmapQuarterResponseDto,
  RoadmapResponseDto,
  RoadmapCategoryRowTaskResponseDto,
  UpdateRoadmapCategoryDto,
  UpdateRoadmapMilestoneDto,
  UpdateRoadmapQuarterDto,
  UpdateRoadmapCategoryRowTaskDto,
  UpdateRoadmapDto,
  MoveRoadmapCategoryRowTaskDto,
} from "./dtos";
import { ApiResponseStatus } from "src/common/interfaces";
import { User, UserDocument } from "src/user/user.schema";
import { ROADMAP } from "src/common/constants";
import { getUserReferencePopulate } from "src/user/user.populate";

@Injectable()
export class RoadmapService {
  constructor(
    @InjectModel(Roadmap.name)
    private readonly roadmapModel: Model<RoadmapDocument>,
    private readonly roadmapMapperService: RoadmapMapperService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
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
      .populate(getUserReferencePopulate("userIds"))
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

  async addUser(
    userId: string,
    roadmapId: string,
    targetUserId: string
  ): Promise<ApiResponseStatus> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException("Target user id is not a valid mongo id");
    }

    const targetUser = await this.userModel.findById(targetUserId).lean();
    if (!targetUser) {
      throw new NotFoundException("Target user not found");
    }

    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) {
      throw new NotFoundException("Board not found");
    }
    if (roadmap.userIds.includes(targetUserId as any)) {
      throw new BadRequestException("This user is already in the roadmap");
    }
    if (roadmap.userIds.length >= ROADMAP.USER_IDS.MAX) {
      throw new BadRequestException(
        `Cannot add more than ${ROADMAP.USER_IDS.MAX} users to a roadmap`
      );
    }

    roadmap.userIds.push(targetUserId as any);
    roadmap.updatedAt = new Date();

    await roadmap.save();

    return { success: true };
  }

  async removeUser(
    userId: string,
    roadmapId: string,
    targetUserId: string
  ): Promise<ApiResponseStatus> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException("Target user id is not a valid mongo id");
    }
    if (userId === targetUserId) {
      throw new BadRequestException(
        "The creator cannot remove himself from the roadmap"
      );
    }

    const roadmap = await this.roadmapModel
      .findOneAndUpdate(
        { _id: roadmapId, userId },
        { $pull: { userIds: targetUserId }, updatedAt: new Date() }
      )
      .lean();
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }

    return { success: true };
  }

  async leave(userId: string, roadmapId: string): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({
      _id: roadmapId,
      userIds: userId,
    });
    if (!roadmap) {
      throw new NotFoundException("Roadmap not found");
    }
    if (roadmap.userId.toString() === userId) {
      throw new BadRequestException("Creator cannot leave the roadmap");
    }

    roadmap.userIds = roadmap.userIds.filter((id) => id.toString() !== userId);
    roadmap.updatedAt = new Date();

    await roadmap.save();

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
    dto: CreateRoadmapCategoryDto
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
    dto: UpdateRoadmapCategoryDto
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
    dto: CreateRoadmapCategoryRowTaskDto
  ): Promise<RoadmapCategoryRowTaskResponseDto> {
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
    dto: UpdateRoadmapCategoryRowTaskDto
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

  async moveTask(
    userId: string,
    roadmapId: string,
    taskId: string,
    fromCategoryId: string,
    fromRowId: string,
    dto: MoveRoadmapCategoryRowTaskDto
  ): Promise<ApiResponseStatus> {
    const roadmap = await this.roadmapModel.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new NotFoundException("Roadmap not found");

    const fromCategory = roadmap.categories.id(fromCategoryId);
    if (!fromCategory) throw new NotFoundException("Category not found");

    const fromRow = fromCategory.rows.id(fromRowId);
    if (!fromRow) throw new NotFoundException("Row not found");

    const task = fromRow.tasks.id(taskId);
    if (!task) throw new NotFoundException("Task not found");

    const toCategory = roadmap.categories.id(dto.toCategoryId);
    if (!toCategory) throw new NotFoundException("Target category not found");

    const toRow = toCategory.rows.id(dto.toRowId);
    if (!toRow) throw new NotFoundException("Target row not found");

    fromRow.tasks.pull(taskId);
    const now = new Date();
    toRow.tasks.push({
      ...task.toObject(),
      start: dto.start,
      end: dto.end,
      updatedAt: now,
    });
    fromCategory.updatedAt = now;
    fromRow.updatedAt = now;
    toCategory.updatedAt = now;
    toRow.updatedAt = now;
    roadmap.updatedAt = now;

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
    dto: CreateRoadmapMilestoneDto
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
    dto: UpdateRoadmapMilestoneDto
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
    dto: CreateRoadmapQuarterDto
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
    dto: UpdateRoadmapQuarterDto
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
