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
  CreateRoadmapDto,
  RoadmapBaseResponseDto,
  RoadmapResponseDto,
} from "./dtos";
import { UpdateRoadmapDto } from "./dtos/update-roadmap.dto";

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
  ): Promise<{ success: boolean }> {
    return this.roadmapService.updateRoadmap(userId, id, dto);
  }

  @Delete(":id")
  @UseGuards(BannedUserGuard)
  deleteRoadmap(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<{ success: boolean }> {
    return this.roadmapService.deleteRoadmap(userId, id);
  }
}
