import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

import { Category } from './category.schema';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { QueryCategoryDto } from './dtos/query-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async findOne(id: string): Promise<Category> {
    const foundCategory = await this.categoryModel.findById(id);
    if (!foundCategory) throw new NotFoundException('Category not found');
    
    return foundCategory;
  }

  find(query: QueryCategoryDto): Promise<Category[]> {
    return this.categoryModel.find(query);
  }

  create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create({
      ...createCategoryDto,
      userId: '64fb1939b44653227cee1813',
    });
  }

  async update(id: string, attrs: Partial<Category>): Promise<Category> {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      attrs,
    );
    if (!updatedCategory) throw new NotFoundException('Category not found');

    return updatedCategory;
  }

  remove(id: string): Promise<Category> {
    return this.categoryModel.findByIdAndDelete(id);
  }
}
