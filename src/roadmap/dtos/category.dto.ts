import { IsOptional, IsString, Length } from "class-validator";

export class CreateRoadmapCategoryDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsString()
  @Length(1, 20)
  color: string;
}

export class UpdateRoadmapCategoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  color: string;
}
