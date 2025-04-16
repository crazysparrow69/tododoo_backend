import { IsOptional, IsString, Length } from "class-validator";

export class CreateBoardTagDto {
  @IsString()
  @Length(1, 20)
  title: string;

  @IsString()
  @Length(1, 20)
  color: string;
}

export class UpdateBoardTagDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  color?: string;
}
