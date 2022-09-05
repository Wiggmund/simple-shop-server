import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './users/entity/user.entity';

@Injectable()
export class EntitiesService {
	async checkForDublicates<D, E>(
		dto: D,
		uniqueFieldsToCheck: FindOptionsWhere<E>[], // Used just for getting keys
		repository: Repository<E>,
		entityName = 'Entity'
	): Promise<E> {
		const findOptions: FindOptionsWhere<E>[] = uniqueFieldsToCheck.map(
			(item) => {
				Object.keys(item).forEach((key) => {
					if (!dto[key]) {
						throw new HttpException(
							`DTO and uniqueFieldsToCheck are not consistent. There is ${key} key in uniqueFieldsToCheck but not in DTO or it has falsy value`,
							HttpStatus.INTERNAL_SERVER_ERROR
						);
					}

					item[key] = dto[key];
				});
				return item;
			}
		);

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
