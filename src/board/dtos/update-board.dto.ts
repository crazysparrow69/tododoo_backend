import { IsArray, IsMongoId, IsOptional, IsString } from "class-validator";

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  userIds?: string[];
}
