import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { CategoryService } from "./category.service";
import {
  CategoryResponseDto,
  CreateCategoryDto,
  QueryCategoryDto,
  UpdateCategoryDto,
} from "./dtos";
import { CurrentUser } from "../auth/decorators";
import { AuthGuard, BannedUserGuard } from "../auth/guards";

@Controller("category")
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get("/:id")
  getCategory(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(userId, id);
  }

  @Get("/")
  getCategories(
    @CurrentUser() userId: string,
    @Query() query: QueryCategoryDto
  ): Promise<{
    categories: CategoryResponseDto[];
    currentPage: number;
    totalPages: number;
  }> {
    return this.categoryService.find(userId, query);
  }

  @Post("/")
  @UseGuards(BannedUserGuard)
  @HttpCode(HttpStatus.CREATED)
  createCategory(
    @CurrentUser() userId: string,
    @Body() body: CreateCategoryDto
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(userId, body);
  }

  @Patch("/:id")
  @UseGuards(BannedUserGuard)
  updateCategory(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() body: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(userId, id, body);
  }

  @Delete("/:id")
  @UseGuards(BannedUserGuard)
  removeCategory(
    @CurrentUser() userId: string,
    @Param("id") id: string
  ): Promise<{ success: boolean }> {
    return this.categoryService.remove(userId, id);
  }
}
