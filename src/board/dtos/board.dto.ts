import { IsOptional, IsString, Length } from "class-validator";
import { BOARD } from "src/common/constants";

export class CreateBoardDto {
  @IsString()
  @Length(BOARD.TITLE.MIN, BOARD.TITLE.MAX)
  title: string;

  @IsString()
  @Length(BOARD.DESCRIPTION.MIN, BOARD.DESCRIPTION.MAX)
  description: string;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @Length(BOARD.TITLE.MIN, BOARD.TITLE.MAX)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(BOARD.DESCRIPTION.MIN, BOARD.DESCRIPTION.MAX)
  description?: string;
}
