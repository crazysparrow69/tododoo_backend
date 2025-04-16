import { IsOptional, IsString, Length } from "class-validator";

export class CreateBoardDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsString()
  @Length(0, 1000)
  description: string;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}
