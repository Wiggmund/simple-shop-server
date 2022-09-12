import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class EntitiesService {
	async checkForDublicates2<D, E>(
		dto: D,
		uniqueFieldsToCheck: FindOptionsWhere<E>[], // Used just for getting keys
		repository: Repository<E>,
		entityName = 'Entity',
		filter: FindOptionsWhere<E>[] = []
	): Promise<E> {
		const findOptions: FindOptionsWhere<E>[] = uniqueFieldsToCheck.map(
			(item) => {
				const findOptionItem = {};
				Object.keys(item).forEach((key) => {
					dto[key]
						? (findOptionItem[key] = dto[key])
						: (findOptionItem[key] = item[key]);
				});
				return findOptionItem;
			}
		);

		console.log(
			'USER',
			await repository.findOne({
				where: filter
			})
		);
		let candidate;
		if (findOptions.length > 0) {
			candidate = await repository.findOne({
				where: findOptions
			});
		}

		if (candidate) {
			const dublicatedFields = this.getDublicatedFields<E>(
				findOptions,
				candidate
			);
			throw new HttpException(
				`${entityName} with given [${dublicatedFields.join(
					', '
				)}] fields already exists`,
				HttpStatus.BAD_REQUEST
			);
		}

		return candidate;
	}

	doDtoHaveUniqueFields<D>(dto: D, uniqueFields: string[]): boolean {
		const dtoKeys = Object.keys(dto);
		return dtoKeys.some((key) => uniqueFields.includes(key));
	}

	async checkForDublicates<E>(
		repository: Repository<E>,
		findOptions: FindOptionsWhere<E>[],
		entityName = 'Entity'
	): Promise<void> {
		const candidate = await repository.findOne({
			where: findOptions
		});

		if (candidate) {
			const dublicatedFields = this.getDublicatedFields<E>(
				findOptions,
				candidate
			);

			throw new HttpException(
				`${entityName} with given [${dublicatedFields.join(
					', '
				)}] fields already exists`,
				HttpStatus.BAD_REQUEST
			);
		}
	}

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

	getFindOptionsToFindDublicates<E>(
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

	private getDublicatedFields<E>(
		findOptionItems: Record<string, any>[],
		entity: E
	): string[] {
		const dublicates: string[] = [];

		findOptionItems.forEach((item) => {
			const itemKeys = Object.keys(item);
			const dublicatedProps = [];

			for (const key of itemKeys) {
				if (entity[key] === item[key]) {
					dublicatedProps.push(`${key}=${entity[key]}`);
				} else {
					break;
				}
			}

			if (
				dublicatedProps.length > 0 &&
				dublicatedProps.length === itemKeys.length
			) {
				dublicates.push(dublicatedProps.join(' + '));
			}
		});

		return dublicates;
	}
}
