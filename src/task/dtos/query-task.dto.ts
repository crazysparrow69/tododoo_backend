import { IsOptional, IsString } from 'class-validator';

export class QueryTaskDto {
  @IsString()
  @IsOptional()
  categories: string;

  @IsString()
  @IsOptional()
  isCompleted: string;

  @IsString()
  @IsOptional()
  deadline: string;

  @IsString()
  @IsOptional()
  page: number;

  @IsString()
  @IsOptional()
  limit: number;
}
