import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { Category } from './entity/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ICategoryUniqueFields } from './types/category-unique-fields.interface';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private categoryRepository: Repository<Category>,
		private entitiesService: EntitiesService
	) {}

	async getAllCategories(): Promise<Category[]> {
		return this.categoryRepository.find();
	}

	async getCategoryById(id: number): Promise<Category> {
		return this.categoryRepository.findOne({ where: { id } });
	}

	async createCategory(categoryDto: CreateCategoryDto): Promise<Category> {
		await this.entitiesService.checkForDublicates<
			CreateCategoryDto,
			ICategoryUniqueFields,
			Category
		>(categoryDto, { category_name: '' }, this.categoryRepository);

		const newCategory = this.categoryRepository.create(categoryDto);
		return this.categoryRepository.save(newCategory);
	}

	async updateCategory(
		categoryDto: UpdateCategoryDto,
		id: number
	): Promise<Category> {
		await this.entitiesService.isExist<Category>(
			[{ id }],
			this.categoryRepository
		);
		await this.entitiesService.checkForDublicates<
			UpdateCategoryDto,
			ICategoryUniqueFields,
			Category
		>(categoryDto, { category_name: '' }, this.categoryRepository);

		await this.categoryRepository.update(id, categoryDto);
		// Get updated data about category and return it
		return await this.getCategoryById(id);
	}

	async deleteCategory(id: number): Promise<Category> {
		const category = await this.entitiesService.isExist<Category>(
			[{ id }],
			this.categoryRepository
		);
		await this.categoryRepository.delete(id);
		return category;
	}
}
