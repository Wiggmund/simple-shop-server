import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class EntitiesService {
	async checkForDublicates<D, T, E>(
		dto: D,
		uniqueFields: T, // Used just for getting keys
		repository: Repository<E>,
		entityName = 'Entity'
	): Promise<E> {
		const findOptions: Record<string, any>[] = [];

		for (const key of Object.keys(uniqueFields)) {
			if (dto[key]) {
				const searchField = {};
				searchField[key] = dto[key];
				findOptions.push(searchField);
			}
		}

		let candidate;
		if (findOptions.length > 0) {
			candidate = await repository.findOne({
				where: findOptions
			});
		}

		if (candidate) {
			const dublicatedFields = getDublicatedFields(
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

		function getDublicatedFields(
			findOptionItems: Record<string, any>[],
			entity: E
		): string[] {
			const dublicates: string[] = [];

			findOptionItems.forEach((item) => {
				Object.keys(item).forEach((key) => {
					if (entity[key] === item[key]) {
						dublicates.push(key);
					}
				});
			});

			return dublicates;
		}
	}

	async isExist<E>(
		findOptions: FindOptionsWhere<E>[],
		repository: Repository<E>,
		entityName = 'Entity'
	): Promise<E> {
		const candidate = await repository.findOne({ where: findOptions });

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
}
