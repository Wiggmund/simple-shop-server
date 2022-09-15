import { Injectable } from '@nestjs/common';
import {
	DataSource,
	EntityManager,
	EntityTarget,
	FindOptionsWhere,
	Repository
} from 'typeorm';
import { TransactionKit } from '../common/types/transaction-kit.interface';
import { MethodArgumentsException } from '../common/exceptions/method-arguments.exception';
import { EntityFieldsException } from '../common/exceptions/entity-fields.exception';
import { EntityNotFoundException } from '../common/exceptions/entity-not-found.exception';
import { DatabaseInternalException } from '../common/exceptions/database-internal.exception';

@Injectable()
export class EntitiesService {
	constructor(private dataSource: DataSource) {}

	async isExist<E>(
		manager: EntityManager,
		keyValue: Partial<E>,
		entity: EntityTarget<E>
	): Promise<boolean> {
		try {
			const repository = this.getRepository<E>(manager, null, entity);
			const entityName = repository.metadata.tableName;
			const [field, value] = Object.entries(keyValue)[0];
			const candidate = await repository
				.createQueryBuilder(entityName)
				.select(`${entityName}.${field}`)
				.where(`${entityName}.${field} = :value`, { value })
				.getOne();

			if (!candidate) {
				throw new EntityNotFoundException(
					`${entityName} with given ${field}=${value} not found`
				);
			}

			return true;
		} catch (err) {
			if (err instanceof MethodArgumentsException) {
				throw new MethodArgumentsException(
					`Didn't provide [manager] argument`
				);
			}
			if (err instanceof EntityNotFoundException) {
				throw err;
			}

			throw new DatabaseInternalException(err);
		}
	}

	doDtoHaveUniqueFields<D>(dto: D, uniqueFields: string[]): boolean {
		const dtoKeys = Object.keys(dto);
		return dtoKeys.some((key) => uniqueFields.includes(key));
	}

	getRepository<E>(
		manager: EntityManager | null = null,
		repository: Repository<E>,
		entity: EntityTarget<E>
	): Repository<E> {
		if (!manager) {
			if (!repository) {
				throw new MethodArgumentsException(
					`Didn't provide [repository] argument`
				);
			}

			return repository;
		}

		return manager.getRepository<E>(entity);
	}

	getTransactionKit<E>(entity: EntityTarget<E>): TransactionKit<E> {
		const queryRunner = this.dataSource.createQueryRunner();
		const manager = queryRunner.manager;
		const repository = this.getRepository<E>(manager, null, entity);

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

	getUniqueFieldsList<E>(conditions: FindOptionsWhere<E>[]): string[] {
		return conditions.map((option) => Object.keys(option)).flat();
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

			throw new EntityFieldsException(
				`${entityName} with given [${duplicatedFields.join(
					', '
				)}] fields already exists`
			);
		}
	}
}
