import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
	constructor(private categoriesService: CategoriesService) {}

	@Get()
	getAllCategories() {
		return this.categoriesService.getAllCategories();
	}

	@Get(':id')
	getCategoryById(@Param('id') id: number) {
		return this.categoriesService.getCategoryById(id);
	}

	@Post()
	createCategory(@Body() categoryDto: CreateCategoryDto) {
		return this.categoriesService.createCategory(categoryDto);
	}

	@Put(':id')
	updateCategory(
		@Body() categoryDto: UpdateCategoryDto,
		@Param('id') id: number
	) {
		return this.categoriesService.updateCategory(categoryDto, id);
	}

	@Delete(':id')
	deleteCategory(@Param('id') id: number) {
		return this.categoriesService.deleteCategory(id);
	}
}
