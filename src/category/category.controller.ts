import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { QueryCategoryDto } from './dtos/query-category.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateCategoryPipe } from './pipes/update-category.pipe';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/:id')
  getCategory(@Request() req, @Param('id') id: string) {
    return this.categoryService.findOne(req.user.sub, id);
  }

  @Get('/')
  getCategories(@Request() req, @Query() query: QueryCategoryDto) {
    return this.categoryService.find(req.user.sub, query);
  }

  @Post('/')
  createCategory(@Request() req, @Body() body: CreateCategoryDto) {
    return this.categoryService.create(req.user.sub, body);
  }

  @Patch('/:id')
  updateCategory(
    @Request() req,
    @Param('id') id: string,
    @Body(UpdateCategoryPipe) body: UpdateCategoryDto,
  ) {
    return this.categoryService.update(req.user.sub, id, body);
  }

  @Delete('/:id')
  removeCategory(@Request() req, @Response() res, @Param('id') id: string) {
    this.categoryService.remove(req.user.sub, id);

    return res.sendStatus(204);
  }
}
