import { IsOptional, IsString, Length } from "class-validator";

export class UpdateRoadmapDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}
