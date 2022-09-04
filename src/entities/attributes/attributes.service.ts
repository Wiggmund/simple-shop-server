import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { Attribute } from './entity/attribute.entity';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { IAttributeUniqueFields } from './types/attribute-unique-fields.interface';

@Injectable()
export class AttributesService {
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

	async createAttribute(
		attributeDto: CreateAttributeDto
	): Promise<Attribute> {
		await this.entitiesService.checkForDublicates<
			CreateAttributeDto,
			IAttributeUniqueFields,
			Attribute
		>(attributeDto, { attribute_name: '' }, this.attributeRepository);

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
		await this.entitiesService.checkForDublicates<
			UpdateAttributeDto,
			IAttributeUniqueFields,
			Attribute
		>(attributeDto, { attribute_name: '' }, this.attributeRepository);

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
}
