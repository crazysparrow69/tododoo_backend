import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { RoadmapService } from "./roadmap.service";
import { AuthGuard, BannedUserGuard } from "src/auth/guards";
import { CurrentUser } from "src/auth/decorators";
import {
  CreateCategoryDto,
  CreateRoadmapDto,
  CreateTaskDto,
  RoadmapBaseResponseDto,
  RoadmapCategoryResponseDto,
  RoadmapCategoryRowResponseDto,
  RoadmapResponseDto,
  RoadmapTaskResponseDto,
  UpdateCategoryDto,
  UpdateTaskDto,
} from "./dtos";
import { UpdateRoadmapDto } from "./dtos/update-roadmap.dto";
import { ApiResponseStatus } from "src/common/interfaces";

@Controller("roadmap")
@UseGuards(AuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get()
  getRoadmaps(
    @CurrentUser() userId: string
  ): Promise<RoadmapBaseResponseDto[]> {
    return this.roadmapService.findRoadmaps(userId);
  }

  @Get(":id")
  getRoadmap(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<RoadmapResponseDto> {
    return this.roadmapService.findRoadmap(userId, id);
  }

  @Post()
  @UseGuards(BannedUserGuard)
  createRoadmap(
    @CurrentUser() userId: string,
    @Body() dto: CreateRoadmapDto
  ): Promise<RoadmapBaseResponseDto> {
    return this.roadmapService.createRoadmap(userId, dto);
  }

  @Patch(":id")
  @UseGuards(BannedUserGuard)
  updateRoadmap(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateRoadmapDto
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.updateRoadmap(userId, id, dto);
  }

  @Delete(":id")
  @UseGuards(BannedUserGuard)
  deleteRoadmap(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.deleteRoadmap(userId, id);
  }

  @Post(":roadmapId/category")
  @UseGuards(BannedUserGuard)
  createCategory(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Body() dto: CreateCategoryDto
  ): Promise<RoadmapCategoryResponseDto> {
    return this.roadmapService.createCategory(userId, roadmapId, dto);
  }

  @Patch(":roadmapId/category/:categoryId")
  @UseGuards(BannedUserGuard)
  updateCategory(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string,
    @Body() dto: UpdateCategoryDto
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.updateCategory(
      userId,
      roadmapId,
      categoryId,
      dto
    );
  }

  @Delete(":roadmapId/category/:categoryId")
  @UseGuards(BannedUserGuard)
  deleteCategory(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.deleteCategory(userId, roadmapId, categoryId);
  }

  @Post(":roadmapId/category/:categoryId/row")
  @UseGuards(BannedUserGuard)
  createCategoryRow(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string
  ): Promise<RoadmapCategoryRowResponseDto> {
    return this.roadmapService.createCategoryRow(userId, roadmapId, categoryId);
  }

  @Delete(":roadmapId/category/:categoryId/row/:rowId")
  @UseGuards(BannedUserGuard)
  deleteCategoryRow(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string,
    @Param("rowId") rowId: string
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.deleteCategoryRow(
      userId,
      roadmapId,
      categoryId,
      rowId
    );
  }

  @Post(":roadmapId/category/:categoryId/row/:rowId/task")
  @UseGuards(BannedUserGuard)
  createCategoryRowTask(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string,
    @Param("rowId") rowId: string,
    @Body() dto: CreateTaskDto
  ): Promise<RoadmapTaskResponseDto> {
    return this.roadmapService.createTask(
      userId,
      roadmapId,
      categoryId,
      rowId,
      dto
    );
  }

  @Patch(":roadmapId/category/:categoryId/row/:rowId/task/:taskId")
  @UseGuards(BannedUserGuard)
  updateCategoryRowTask(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string,
    @Param("rowId") rowId: string,
    @Param("taskId") taskId: string,
    @Body() dto: UpdateTaskDto
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.updateTask(
      userId,
      roadmapId,
      categoryId,
      rowId,
      taskId,
      dto
    );
  }

  @Delete(":roadmapId/category/:categoryId/row/:rowId/task/:taskId")
  @UseGuards(BannedUserGuard)
  deleteCategoryRowTask(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string,
    @Param("rowId") rowId: string,
    @Param("taskId") taskId: string
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.deleteTask(
      userId,
      roadmapId,
      categoryId,
      rowId,
      taskId
    );
  }
}
