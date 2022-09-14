import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
	DataSource,
	EntityManager,
	FindOptionsWhere,
	Repository
} from 'typeorm';
import { Vendor } from './vendors/entity/vendor.entity';
import { User } from './users/entity/user.entity';
import { Transaction } from './transactions/entity/transaction.entity';
import { Role } from './roles/entity/role.entity';
import { Product } from './products/entity/product.entity';
import { Photo } from './photos/entity/photo.entity';
import { Comment } from './comments/entity/comment.entity';
import { Category } from './categories/entity/category.entity';
import { Attribute } from './attributes/entity/attribute.entity';
import { ProductToAttribute } from './products/entity/product-to-attribute.entity';
import { AvailableEntities } from '../common/types/available-entities.interface';
import { TransactionKit } from '../common/types/transaction-kit.interface';

@Injectable()
export class EntitiesService {
	constructor(private dataSource: DataSource) {}

	async isExist<E>(
		findOptions: FindOptionsWhere<E>[],
		repository: Repository<E>,
		relations = null,
		entityName = 'Entity'
	): Promise<E> {
		const candidate = relations
			? await repository.findOne({ where: findOptions, relations })
			: await repository.findOne({ where: findOptions });

		if (!candidate) {
			const findOptionItems = findOptions.map(
				(item: Record<string, any>) => {
					return Object.keys(item)[0];
				}
			);

			throw new HttpException(
				`${entityName} with given [${findOptionItems.join(
					', '
				)}] fields not found`,
				HttpStatus.NOT_FOUND
			);
		}

		return candidate;
	}

	doDtoHaveUniqueFields<D>(dto: D, uniqueFields: string[]): boolean {
		const dtoKeys = Object.keys(dto);
		return dtoKeys.some((key) => uniqueFields.includes(key));
	}

	getRepository<E>(
		manager: EntityManager | null = null,
		repository: Repository<E>,
		entityName: AvailableEntities
	): Repository<E> {
		if (!manager) {
			if (!repository) {
				throw new HttpException(
					`Didn't provide [repository] argument for ${this.getRepository.name}`,
					HttpStatus.INTERNAL_SERVER_ERROR
				);
			}

			return repository;
		}

		return this.getEntityRepository<E>(manager, entityName);
	}

	getTransactionKit<E>(entityName: AvailableEntities): TransactionKit<E> {
		const queryRunner = this.dataSource.createQueryRunner();
		const manager = queryRunner.manager;
		const repository = this.getEntityRepository<E>(manager, entityName);

		return { queryRunner, repository, manager };
	}

	async findEntityDuplicate<E>(
		entity: E | null,
		entityDto: Partial<E>,
		repository: Repository<E>,
		entityUniqueFieldsToCheck: FindOptionsWhere<E>[]
	): Promise<void> {
		const findOptions = this.getFindOptionsToFindDuplicates<E>(
			entity,
			entityDto,
			entityUniqueFieldsToCheck
		);

		return this.checkForDuplicates<E>(repository, findOptions, 'Entity');
	}

	private getDuplicatedFields<E>(
		findOptionItems: Record<string, any>[],
		entity: E
	): string[] {
		const duplicates: string[] = [];

		findOptionItems.forEach((item) => {
			const itemKeys = Object.keys(item);
			const duplicatedProps = [];

			for (const key of itemKeys) {
				if (entity[key] === item[key]) {
					duplicatedProps.push(`${key}=${entity[key]}`);
				} else {
					break;
				}
			}

			if (
				duplicatedProps.length > 0 &&
				duplicatedProps.length === itemKeys.length
			) {
				duplicates.push(duplicatedProps.join(' + '));
			}
		});

		return duplicates;
	}

	// TODO: Rewrite using generics without switch...case
	private getEntityRepository<E>(
		manager: EntityManager,
		entityName: AvailableEntities
	): Repository<E> {
		if (!manager) {
			throw new HttpException(
				`Didn't provide [manager]  for ${this.getEntityRepository.name}`,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}

		switch (entityName) {
			case 'Vendor':
				return manager.getRepository(Vendor) as Repository<E>;
			case 'User':
				return manager.getRepository(User) as Repository<E>;
			case 'Transaction':
				return manager.getRepository(Transaction) as Repository<E>;
			case 'Role':
				return manager.getRepository(Role) as Repository<E>;
			case 'Product':
				return manager.getRepository(Product) as Repository<E>;
			case 'ProductToAttribute':
				return manager.getRepository(
					ProductToAttribute
				) as Repository<E>;
			case 'Photo':
				return manager.getRepository(Photo) as Repository<E>;
			case 'Comment':
				return manager.getRepository(Comment) as Repository<E>;
			case 'Category':
				return manager.getRepository(Category) as Repository<E>;
			case 'Attribute':
				return manager.getRepository(Attribute) as Repository<E>;
		}
	}

	private getFindOptionsToFindDuplicates<E>(
		entity: E | null,
		dto: Partial<E>,
		uniqueFields: FindOptionsWhere<E>[]
	): FindOptionsWhere<E>[] {
		const findOptions: FindOptionsWhere<E>[] = [];

		uniqueFields.forEach((fields) => {
			const condition = {};
			const providedValues = [];

			Object.keys(fields).forEach((field) => {
				providedValues.push(dto[field]);
			});

			const isAnyValueProvided = providedValues.some((value) =>
				Boolean(value)
			);

			// For example if we have unique restriction on
			// firstName + lastName, then if provided dto
			// has only firstName we have to take lastName from user
			// and get condition "firstName and lastName"
			if (isAnyValueProvided) {
				Object.keys(fields).forEach((field) => {
					condition[field] = dto[field] ? dto[field] : entity[field];
				});

				findOptions.push(condition);
			}
		});

		return findOptions;
	}

	private async checkForDuplicates<E>(
		repository: Repository<E>,
		findOptions: FindOptionsWhere<E>[],
		entityName = 'Entity'
	): Promise<void> {
		const candidate = await repository.findOne({
			where: findOptions
		});

		if (candidate) {
			const duplicatedFields = this.getDuplicatedFields<E>(
				findOptions,
				candidate
			);

			throw new HttpException(
				`${entityName} with given [${duplicatedFields.join(
					', '
				)}] fields already exists`,
				HttpStatus.BAD_REQUEST
			);
		}
	}
}
