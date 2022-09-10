import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateProductToAttributeDto } from './dto/create-product-to-attribute.dto';
import { ProductToAttribute } from './entity/product-to-attribute.entity';
import { ProductToAttributeId } from './types/product-to-attribute-id.interface';

@Injectable()
export class ProductToAttributeService {
	constructor(
		@InjectRepository(ProductToAttribute)
		private productToAttributeRepository: Repository<ProductToAttribute>
	) {}

	async createProductToAttributeRecord(
		dto: CreateProductToAttributeDto
	): Promise<number> {
		console.log('dto', dto);
		const recordId = (
			(
				await this.productToAttributeRepository
					.createQueryBuilder()
					.insert()
					.into(ProductToAttribute)
					.values(dto)
					.execute()
			).identifiers as ProductToAttributeId[]
		)[0].id;

		await this.productToAttributeRepository
			.createQueryBuilder()
			.relation(ProductToAttribute, 'product')
			.of(recordId)
			.set(dto.productId);

		await this.productToAttributeRepository
			.createQueryBuilder()
			.relation(ProductToAttribute, 'attribute')
			.of(recordId)
			.set(dto.attributeId);

		return recordId;
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
