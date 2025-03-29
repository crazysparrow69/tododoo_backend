import { IsMongoId } from "class-validator";

export class MoveTaskToAnotherColumnDto {
  @IsMongoId()
  toColumnId: string;
}
