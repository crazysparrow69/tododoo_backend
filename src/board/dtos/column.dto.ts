import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateBoardColumnDto {
  @IsString()
  @Length(1, 50)
  title: string;
}

export class UpdateBoardColumnDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
