import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";

import { CategoryMapperService } from "./category-mapper.service";
import { Category } from "./category.schema";
import {
  CategoryResponseDto,
  CreateCategoryDto,
  QueryCategoryDto,
} from "./dtos";
import { Task } from "../task/schemas";
import { transaction } from "src/common/transaction";
import { ApiResponseStatus } from "src/common/interfaces";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly categoryMapperService: CategoryMapperService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto
  ): Promise<CategoryResponseDto> {
    try {
      const createdCategory = await this.categoryModel.create({
        userId,
        ...createCategoryDto,
      });

      return this.categoryMapperService.toCategoryResponse(createdCategory);
    } catch (err: any) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async findOne(userId: string, id: string): Promise<CategoryResponseDto> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid ObjectId");

    const foundCategory = await this.categoryModel
      .findOne({ _id: id, userId })
      .lean()
      .select(["_id", "title", "color"]);
    if (!foundCategory) throw new NotFoundException("Category not found");

    return this.categoryMapperService.toCategoryResponse(foundCategory);
  }

  async find(
    userId: string,
    query: QueryCategoryDto
  ): Promise<{
    categories: CategoryResponseDto[];
    currentPage: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...params } = query;

    const queryParams = {
      userId,
      ...params,
    };
    const count = await this.categoryModel.countDocuments(queryParams);
    const totalPages = Math.ceil(count / limit);

    const foundCategories = await this.categoryModel
      .find(queryParams)
      .lean()
      .limit(limit)
      .skip((page - 1) * limit)
      .select(["_id", "title", "color"])
      .exec();

    return {
      categories: this.categoryMapperService.toCategories(foundCategories),
      currentPage: page,
      totalPages,
    };
  }

  async update(
    userId: string,
    id: string,
    attrs: Partial<Category>
  ): Promise<CategoryResponseDto> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid ObjectId");

    const updatedCategory = await this.categoryModel
      .findOneAndUpdate({ _id: id, userId }, attrs, { new: true })
      .lean()
      .select(["_id", "title", "color"]);
    if (!updatedCategory) throw new NotFoundException("Category not found");

    return this.categoryMapperService.toCategoryResponse(updatedCategory);
  }

  async remove(userId: string, id: string): Promise<ApiResponseStatus> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid ObjectId");

    await transaction(this.connection, async (session) => {
      const deletedCategory = await this.categoryModel.findOneAndDelete(
        {
          _id: id,
          userId,
        },
        { session }
      );

      if (!deletedCategory) {
        throw new NotFoundException("Cannot delete non-existent category");
      } else {
        await this.taskModel.updateMany(
          { categories: deletedCategory._id },
          {
            $pull: { categories: deletedCategory._id },
          },
          { session }
        );
      }
    });

    return { success: true };
  }
}
