import { IsMongoId, IsNumber, IsOptional, Min } from "class-validator";

export class MoveTaskDto {
  @IsMongoId()
  targetColumnId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
