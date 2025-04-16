import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateRoadmapMilestoneDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsNumber()
  @Min(0)
  position: number;
}

export class UpdateRoadmapMilestoneDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: string;
}
