import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { BOARD } from 'src/common/constants';

export class CreateBoardColumnDto {
  @IsString()
  @Length(BOARD.COLUMNS.TITLE.MIN, BOARD.COLUMNS.TITLE.MAX)
  title: string;
}

export class UpdateBoardColumnDto {
  @IsOptional()
  @IsString()
  @Length(BOARD.COLUMNS.TITLE.MIN, BOARD.COLUMNS.TITLE.MAX)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
