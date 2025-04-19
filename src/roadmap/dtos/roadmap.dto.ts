import { IsOptional, IsString, Length } from "class-validator";
import { ROADMAP } from "src/common/constants";

export class CreateRoadmapDto {
  @IsString()
  @Length(ROADMAP.TITLE.MIN, ROADMAP.TITLE.MAX)
  title: string;

  @IsString()
  @Length(ROADMAP.DESCRIPTION.MIN, ROADMAP.DESCRIPTION.MAX)
  description: string;
}

export class UpdateRoadmapDto {
  @IsOptional()
  @IsString()
  @Length(ROADMAP.TITLE.MIN, ROADMAP.TITLE.MAX)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(ROADMAP.DESCRIPTION.MIN, ROADMAP.DESCRIPTION.MAX)
  description?: string;
}
