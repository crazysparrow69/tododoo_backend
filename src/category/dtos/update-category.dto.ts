import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  color: string;
}