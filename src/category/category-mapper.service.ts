import { Injectable } from "@nestjs/common";
import { Category } from "./category.schema";
import { CategoryResponseDto } from "./dtos";
import { mapDocuments } from "src/common/mapDocuments";

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
    return mapDocuments<Category, CategoryResponseDto>(
      categories,
      this.toCategoryResponse.bind(this)
    );
  }
}
