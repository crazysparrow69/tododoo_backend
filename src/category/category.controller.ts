import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { QueryCategoryDto } from './dtos/query-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/:id')
  getCategory(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Get('/')
  getCategories(@Query() query: QueryCategoryDto) {
    return this.categoryService.find(query);
  }

  @Post('/')
  createCategory(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Patch('/:id')
  updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.categoryService.update(id, body);
  }

  @Delete('/:id')
  removeCategory(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
