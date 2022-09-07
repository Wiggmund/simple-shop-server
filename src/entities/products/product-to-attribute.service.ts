import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateProductToAttributeDto } from './dto/create-product-to-attribute.dto';
import { ProductToAttribute } from './entity/product-to-attribute.entity';

@Injectable()
export class ProductToAttributeService {
	constructor(
		@InjectRepository(ProductToAttribute)
		private productToAttributeRepository: Repository<ProductToAttribute>
	) {}

	async createAttributeRecord(
		dto: CreateProductToAttributeDto
	): Promise<ProductToAttribute> {
		console.log('dto', dto);
		const record = await this.productToAttributeRepository.create(dto);
		return this.productToAttributeRepository.save(record);
	}

	async deleteManyByCreteria(
		findOptions: FindOptionsWhere<ProductToAttribute>[]
	) {
		const records = await this.productToAttributeRepository.find({
			where: findOptions
		});
		return this.productToAttributeRepository.remove([...records]);
	}
}
