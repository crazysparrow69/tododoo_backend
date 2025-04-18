import { IsOptional, IsString, Length } from "class-validator";
import { TAG } from "src/common/constants";

export class CreateBoardTagDto {
  @IsString()
  @Length(TAG.TITLE.MIN, TAG.TITLE.MAX)
  title: string;

  @IsString()
  @Length(TAG.COLOR.MIN, TAG.COLOR.MAX)
  color: string;
}

export class UpdateBoardTagDto {
  @IsOptional()
  @IsString()
  @Length(TAG.TITLE.MIN, TAG.TITLE.MAX)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(TAG.COLOR.MIN, TAG.COLOR.MAX)
  color?: string;
}
