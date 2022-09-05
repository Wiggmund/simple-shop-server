import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { Category } from './entity/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryUniqueFields } from './types/category-unique-fields.interface';

@Injectable()
export class CategoriesService {
	private readonly categoryUniqueFieldsToCheck: Partial<CategoryUniqueFields>[] =
		[{ category_name: '' }];

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
		await this.findCategoryDublicate<CreateCategoryDto>(categoryDto);
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
		await this.findCategoryDublicate<UpdateCategoryDto>(categoryDto);

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

	private async findCategoryDublicate<D>(categoryDto: D): Promise<Category> {
		return await this.entitiesService.checkForDublicates<D, Category>(
			categoryDto,
			this.categoryUniqueFieldsToCheck,
			this.categoryRepository
		);
	}
}
