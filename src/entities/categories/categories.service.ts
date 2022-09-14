import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';

import { Category } from './entity/category.entity';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { EntitiesService } from '../entities.service';

import { CategoryUniqueFields } from './types/category-unique-fields.interface';
import { CategoryId } from './types/category-id.interface';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';

@Injectable()
export class CategoriesService {
	private readonly categoryUniqueFieldsToCheck: FindOptionsWhere<CategoryUniqueFields>[] =
		[{ category_name: '' }];

	private uniqueFields: string[] = this.categoryUniqueFieldsToCheck
		.map((option) => Object.keys(option))
		.flat();

	constructor(
		@InjectRepository(Category)
		private categoryRepository: Repository<Category>,
		private entitiesService: EntitiesService
	) {}

	async getAllCategories(
		manager: EntityManager | null = null
	): Promise<Category[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.categoryRepository,
			AvailableEntitiesEnum.Category
		);

		return repository.createQueryBuilder('category').getMany();
	}

	async getCategoryById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Category> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.categoryRepository,
			AvailableEntitiesEnum.Category
		);

		return repository
			.createQueryBuilder('category')
			.where('category.id = :id', { id })
			.getOne();
	}

	async getCategoryByName(
		category_name: string,
		manager: EntityManager | null = null
	): Promise<Category> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.categoryRepository,
			AvailableEntitiesEnum.Category
		);

		const candidate = await repository
			.createQueryBuilder('category')
			.where('category.category_name = :category_name', { category_name })
			.getOne();

		if (!candidate) {
			throw new HttpException(
				'Category with given category_name not found',
				HttpStatus.NOT_FOUND
			);
		}

		return candidate;
	}

	async createCategory(categoryDto: CreateCategoryDto): Promise<Category> {
		const { queryRunner, repository } =
			this.entitiesService.getTransactionKit<Category>(
				AvailableEntitiesEnum.Category
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.entitiesService.findEntityDublicate<Category>(
				null,
				categoryDto,
				repository,
				this.categoryUniqueFieldsToCheck
			);

			const categoryId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(Category)
						.values(categoryDto)
						.execute()
				).identifiers as CategoryId[]
			)[0].id;

			const createdCategory = await repository
				.createQueryBuilder('category')
				.where('category.id = :categoryId', { categoryId })
				.getOne();

			await queryRunner.commitTransaction();
			return createdCategory;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async updateCategory(
		categoryDto: UpdateCategoryDto,
		id: number
	): Promise<Category> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Category>(
				AvailableEntitiesEnum.Category
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const category = await this.entitiesService.isExist<Category>(
				[{ id }],
				repository
			);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateCategoryDto>(
					categoryDto,
					this.uniqueFields
				)
			) {
				await this.entitiesService.findEntityDublicate<Category>(
					category,
					categoryDto,
					repository,
					this.categoryUniqueFieldsToCheck
				);
			}

			await repository
				.createQueryBuilder()
				.update(Category)
				.set(categoryDto)
				.where('id = :id', { id })
				.execute();

			const updatedCategory = await this.getCategoryById(id, manager);

			await queryRunner.commitTransaction();
			return updatedCategory;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteCategory(id: number): Promise<Category> {
		const { queryRunner, repository } =
			this.entitiesService.getTransactionKit<Category>(
				AvailableEntitiesEnum.Category
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const category = await this.entitiesService.isExist<Category>(
				[{ id }],
				repository
			);

			await repository
				.createQueryBuilder()
				.delete()
				.from(Category)
				.where('id = :id', { id })
				.execute();

			await queryRunner.commitTransaction();
			return category;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}
}
