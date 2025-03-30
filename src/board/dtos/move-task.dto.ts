import { IsMongoId, IsNumber, IsOptional } from "class-validator";

export class MoveTaskDto {
  @IsMongoId()
  targetColumnId: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
