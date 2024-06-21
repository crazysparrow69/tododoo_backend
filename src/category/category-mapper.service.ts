import { Injectable } from "@nestjs/common";

import { Category } from "./category.schema";
import { CategoryResponseDto } from "./dtos";

@Injectable()
export class CategoryMapperService {
  toCategoryResponse(category: Category): CategoryResponseDto {
    return {
      _id: category._id.toString(),
      title: category.title,
      color: category.color,
    };
  }

  toCategories(categories: Category[]): CategoryResponseDto[] {
    const result: CategoryResponseDto[] = [];

    for (const category of categories) {
      const mappedCategory = this.toCategoryResponse(category);
      result.push(mappedCategory);
    }

    return result;
  }
}
