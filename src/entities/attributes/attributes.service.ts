import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { Attribute } from './entity/attribute.entity';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { AttributeUniqueFields } from './types/attribute-unique-fields.interface';

@Injectable()
export class AttributesService {
	private readonly attributeUniqueFieldsToCheck: Partial<AttributeUniqueFields>[] =
		[{ attribute_name: '' }];

	constructor(
		@InjectRepository(Attribute)
		private attributeRepository: Repository<Attribute>,
		private entitiesService: EntitiesService
	) {}

	async getAllAttributes(): Promise<Attribute[]> {
		return this.attributeRepository.find();
	}

	async getAttributeById(id: number): Promise<Attribute> {
		return this.attributeRepository.findOne({ where: { id } });
	}

	async getAttributeByName(
		attribute_name: string,
		manager: EntityManager | null = null
	): Promise<Attribute> {
		const repository = this.getRepository(manager);
		const candidate = await repository.findOne({
			where: { attribute_name }
		});

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
		await this.findAttributeDublicate<CreateAttributeDto>(attributeDto);
		const newAttribute = this.attributeRepository.create(attributeDto);
		return this.attributeRepository.save(newAttribute);
	}

	async updateAttribute(
		attributeDto: UpdateAttributeDto,
		id: number
	): Promise<Attribute> {
		await this.entitiesService.isExist<Attribute>(
			[{ id }],
			this.attributeRepository
		);
		await this.findAttributeDublicate<CreateAttributeDto>(attributeDto);

		await this.attributeRepository.update(id, attributeDto);
		// Get updated data about attribute and return it
		return await this.getAttributeById(id);
	}

	async deleteAttribute(id: number): Promise<Attribute> {
		const attribute = await this.entitiesService.isExist<Attribute>(
			[{ id }],
			this.attributeRepository
		);
		await this.attributeRepository.delete(id);
		return attribute;
	}

	private async findAttributeDublicate<D>(
		attributeDto: D
	): Promise<Attribute> {
		return await this.entitiesService.checkForDublicates2<D, Attribute>(
			attributeDto,
			this.attributeUniqueFieldsToCheck,
			this.attributeRepository
		);
	}

	private getRepository(
		manager: EntityManager | null = null
	): Repository<Attribute> {
		const repository = manager
			? manager.getRepository(Attribute)
			: this.attributeRepository;

		return repository;
	}
}
