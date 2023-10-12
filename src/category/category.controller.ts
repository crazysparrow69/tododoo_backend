import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { QueryCategoryDto } from './dtos/query-category.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/:id')
  getCategory(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.categoryService.findOne(userId, id);
  }

  @Get('/')
  getCategories(
    @CurrentUser() userId: string,
    @Query() query: QueryCategoryDto,
  ) {
    return this.categoryService.find(userId, query);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  createCategory(
    @CurrentUser() userId: string,
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoryService.create(userId, body);
  }

  @Patch('/:id')
  updateCategory(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoryService.update(userId, id, body);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCategory(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.categoryService.remove(userId, id);
  }
}
