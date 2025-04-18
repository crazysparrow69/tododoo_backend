import { IsMongoId, IsString } from "class-validator";

export class CreateSubtaskConfirmationDto {
  @IsMongoId()
  assigneeId: string;

  @IsMongoId()
  subtaskId: string;
}
