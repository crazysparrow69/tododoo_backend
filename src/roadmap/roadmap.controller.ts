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

  @Post(":id/add-user/:targetUserId")
  @UseGuards(BannedUserGuard)
  addUser(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Param("targetUserId") targetUserId: string
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.addUser(userId, id, targetUserId);
  }

  @Delete(":id/remove-user/:targetUserId")
  @UseGuards(BannedUserGuard)
  removeUser(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Param("targetUserId") targetUserId: string
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.removeUser(userId, id, targetUserId);
  }

  @Delete(":id/leave")
  @UseGuards(BannedUserGuard)
  leaveRoadmap(
    @CurrentUser() userId: string,
    @Param("id") roadmapId: string
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.leave(userId, roadmapId);
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
    @Body() dto: CreateRoadmapCategoryDto
  ): Promise<RoadmapCategoryResponseDto> {
    return this.roadmapService.createCategory(userId, roadmapId, dto);
  }

  @Patch(":roadmapId/category/:categoryId")
  @UseGuards(BannedUserGuard)
  updateCategory(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string,
    @Body() dto: UpdateRoadmapCategoryDto
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
    @Body() dto: CreateRoadmapCategoryRowTaskDto
  ): Promise<RoadmapCategoryRowTaskResponseDto> {
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
    @Body() dto: UpdateRoadmapCategoryRowTaskDto
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

  @Patch(":roadmapId/category/:categoryId/row/:rowId/task/:taskId/move")
  @UseGuards(BannedUserGuard)
  moveTask(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("categoryId") categoryId: string,
    @Param("rowId") rowId: string,
    @Param("taskId") taskId: string,
    @Body()
    body: MoveRoadmapCategoryRowTaskDto
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.moveTask(
      userId,
      roadmapId,
      taskId,
      categoryId,
      rowId,
      body
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

  @Post(":roadmapId/milestone")
  @UseGuards(BannedUserGuard)
  createMilestone(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Body() dto: CreateRoadmapMilestoneDto
  ): Promise<RoadmapMilestoneResponseDto> {
    return this.roadmapService.createMilestone(userId, roadmapId, dto);
  }

  @Patch(":roadmapId/milestone/:milestoneId")
  @UseGuards(BannedUserGuard)
  updateMilestone(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("milestoneId") milestoneId: string,
    @Body() dto: UpdateRoadmapMilestoneDto
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.updateMilestone(
      userId,
      roadmapId,
      milestoneId,
      dto
    );
  }

  @Delete(":roadmapId/milestone/:milestoneId")
  @UseGuards(BannedUserGuard)
  deleteMilestone(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("milestoneId") milestoneId: string
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.deleteMilestone(userId, roadmapId, milestoneId);
  }

  @Post(":roadmapId/quarter")
  @UseGuards(BannedUserGuard)
  createQuarter(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Body() dto: CreateRoadmapQuarterDto
  ): Promise<RoadmapQuarterResponseDto> {
    return this.roadmapService.createQuarter(userId, roadmapId, dto);
  }

  @Patch(":roadmapId/quarter/:quarterId")
  @UseGuards(BannedUserGuard)
  updateQuarter(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("quarterId") quarterId: string,
    @Body() dto: UpdateRoadmapQuarterDto
  ): Promise<ApiResponseStatus> {
    return this.roadmapService.updateQuarter(userId, roadmapId, quarterId, dto);
  }

  @Delete(":roadmapId/quarter/:quarterId")
  @UseGuards(BannedUserGuard)
  deleteQuarter(
    @CurrentUser() userId: string,
    @Param("roadmapId") roadmapId: string,
    @Param("quarterId") quarterId: string
  ): Promise<RoadmapResponseDto> {
    return this.roadmapService.deleteQuarter(userId, roadmapId, quarterId);
  }
}
