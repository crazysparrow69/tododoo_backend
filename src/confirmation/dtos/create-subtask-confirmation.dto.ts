import { IsMongoId } from "class-validator";

export class CreateSubtaskConfirmationDto {
  @IsMongoId()
  assigneeId: string;

  @IsMongoId()
  subtaskId: string;
}
