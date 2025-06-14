import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { ROADMAP } from "src/common/constants";

export class CreateRoadmapMilestoneDto {
  @IsString()
  @Length(ROADMAP.MILESTONES.TITLE.MIN, ROADMAP.MILESTONES.TITLE.MAX)
  title: string;

  @IsNumber()
  @Min(0)
  position: number;
}

export class UpdateRoadmapMilestoneDto {
  @IsOptional()
  @IsString()
  @Length(ROADMAP.MILESTONES.TITLE.MIN, ROADMAP.MILESTONES.TITLE.MAX)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: string;
}
