import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DataSource,
	EntityManager,
	FindOptionsWhere,
	Repository
} from 'typeorm';

import { Attribute } from './entity/attribute.entity';

import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

import { EntitiesService } from '../entities.service';

import { AttributeUniqueFields } from './types/attribute-unique-fields.interface';
import { TransactionKit } from '../../common/types/transaction-kit.interface';
import { AttributeId } from './types/attribute-id.interface';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';

@Injectable()
export class AttributesService {
	private readonly attributeUniqueFieldsToCheck: FindOptionsWhere<AttributeUniqueFields>[] =
		[{ attribute_name: '' }];

	private uniqueFields: string[] = this.attributeUniqueFieldsToCheck
		.map((option) => Object.keys(option))
		.flat();

	constructor(
		@InjectRepository(Attribute)
		private attributeRepository: Repository<Attribute>,
		private entitiesService: EntitiesService,
		private dataSource: DataSource
	) {}

	async getAllAttributes(
		manager: EntityManager | null = null
	): Promise<Attribute[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.attributeRepository,
			AvailableEntitiesEnum.Attribute
		);

		return repository.createQueryBuilder('attribute').getMany();
	}

	async getAttributeById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Attribute> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.attributeRepository,
			AvailableEntitiesEnum.Attribute
		);

		return repository
			.createQueryBuilder('attribute')
			.where('attribute.id = :id', { id })
			.getOne();
	}

	async getAttributeByName(
		attribute_name: string,
		manager: EntityManager | null = null
	): Promise<Attribute> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.attributeRepository,
			AvailableEntitiesEnum.Attribute
		);

		const candidate = await repository
			.createQueryBuilder('attribute')
			.where('attribute.attribute_name = :attribute_name', {
				attribute_name
			})
			.getOne();

		if (!candidate) {
			throw new HttpException(
				`Attribute with given attribute_name=${attribute_name} not found`,
				HttpStatus.NOT_FOUND
			);
		}

		return candidate;
	}

	async createAttribute(
		attributeDto: CreateAttributeDto
	): Promise<Attribute> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.findAttributeDublicate<CreateAttributeDto>(
				null,
				attributeDto,
				repository
			);

			const attributeId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(Attribute)
						.values(attributeDto)
						.execute()
				).identifiers as AttributeId[]
			)[0].id;

			const createdAttribute = await repository
				.createQueryBuilder('attribute')
				.where('attribute.id = :attributeId', { attributeId })
				.getOne();

			await queryRunner.commitTransaction();
			return createdAttribute;
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

	async updateAttribute(
		attributeDto: UpdateAttributeDto,
		id: number
	): Promise<Attribute> {
		const { queryRunner, repository, manager } =
			this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const attribute = await this.entitiesService.isExist<Attribute>(
				[{ id }],
				repository
			);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateAttributeDto>(
					attributeDto,
					this.uniqueFields
				)
			) {
				await this.findAttributeDublicate<UpdateAttributeDto>(
					attribute,
					attributeDto,
					repository
				);
			}

			await repository
				.createQueryBuilder()
				.update(Attribute)
				.set(attributeDto)
				.where('id = :id', { id })
				.execute();

			const updatedAttribute = await this.getAttributeById(id, manager);

			await queryRunner.commitTransaction();
			return updatedAttribute;
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

	async deleteAttribute(id: number): Promise<Attribute> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const attribute = await this.entitiesService.isExist<Attribute>(
				[{ id }],
				repository
			);

			await repository
				.createQueryBuilder()
				.delete()
				.from(Attribute)
				.where('id = :id', { id })
				.execute();

			await queryRunner.commitTransaction();
			return attribute;
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

	private async findAttributeDublicate<D>(
		attribute: Attribute,
		attributeDto: D,
		repository: Repository<Attribute>
	): Promise<void> {
		const findOptions =
			this.entitiesService.getFindOptionsToFindDublicates<Attribute>(
				attribute,
				attributeDto,
				this.attributeUniqueFieldsToCheck
			);

		return await this.entitiesService.checkForDublicates<Attribute>(
			repository,
			findOptions,
			'Attribute'
		);
	}

	private getQueryRunnerAndRepository(): TransactionKit<Attribute> {
		const queryRunner = this.dataSource.createQueryRunner();
		const manager = queryRunner.manager;
		const repository = manager.getRepository(Attribute);

		return { queryRunner, repository, manager };
	}
}
