import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CategoryMapperService } from "./category-mapper.service";
import { Category } from "./category.schema";
import {
  CategoryResponseDto,
  CreateCategoryDto,
  QueryCategoryDto,
} from "./dtos";
import { Task } from "../task/task.schema";
import { User } from "../user/user.schema";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly categoryMapperService: CategoryMapperService
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

      await this.userModel.findByIdAndUpdate(userId, {
        $push: { categories: createdCategory._id },
      });

      return this.categoryMapperService.toCategoryResponse(createdCategory);
    } catch (err) {
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

  async remove(userId: string, id: string): Promise<{ success: boolean }> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException("Invalid ObjectId");

    const deletedCategory = await this.categoryModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedCategory) {
      throw new NotFoundException("Cannot delete non-existent category");
    } else {
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { categories: deletedCategory._id },
      });
      await this.taskModel.updateMany(
        { categories: deletedCategory._id },
        {
          $pull: { categories: deletedCategory._id },
        }
      );
    }

    return { success: true };
  }
}
