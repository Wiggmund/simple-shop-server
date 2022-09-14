import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';

import { Attribute } from './entity/attribute.entity';

import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

import { EntitiesService } from '../entities.service';

import { AttributeUniqueFields } from './types/attribute-unique-fields.interface';
import { AttributeId } from './types/attribute-id.interface';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { DatabaseInternalException } from '../../common/exceptions/database-internal.exception';

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
		private entitiesService: EntitiesService
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

		const candidate = await repository
			.createQueryBuilder('attribute')
			.where('attribute.id = :id', { id })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`Attribute with given id=${id} not found`
			);
		}

		return candidate;
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
			throw new EntityNotFoundException(
				`Attribute with given attribute_name=${attribute_name} not found`
			);
		}

		return candidate;
	}

	async createAttribute(
		attributeDto: CreateAttributeDto
	): Promise<Attribute> {
		const { queryRunner, repository } =
			this.entitiesService.getTransactionKit<Attribute>(
				AvailableEntitiesEnum.Attribute
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.entitiesService.findEntityDuplicate<Attribute>(
				null,
				attributeDto,
				repository,
				this.attributeUniqueFieldsToCheck
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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async updateAttribute(
		attributeDto: UpdateAttributeDto,
		id: number
	): Promise<Attribute> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Attribute>(
				AvailableEntitiesEnum.Attribute
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const attribute = await this.getAttributeById(id, manager);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateAttributeDto>(
					attributeDto,
					this.uniqueFields
				)
			) {
				await this.entitiesService.findEntityDuplicate<Attribute>(
					attribute,
					attributeDto,
					repository,
					this.attributeUniqueFieldsToCheck
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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteAttribute(id: number): Promise<Attribute> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Attribute>(
				AvailableEntitiesEnum.Attribute
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const attribute = await this.getAttributeById(id, manager);

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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}
}
