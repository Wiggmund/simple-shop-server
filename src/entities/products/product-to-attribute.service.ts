import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { CreateProductToAttributeDto } from './dto/create-product-to-attribute.dto';
import { ProductToAttribute } from './entity/product-to-attribute.entity';
import { ProductIdType } from './types/product-id.interface';
import { ProductToAttributeId } from './types/product-to-attribute-id.interface';

@Injectable()
export class ProductToAttributeService {
	constructor(
		@InjectRepository(ProductToAttribute)
		private productToAttributeRepository: Repository<ProductToAttribute>
	) {}

	async createProductToAttributeRecord(
		dto: CreateProductToAttributeDto,
		manager: EntityManager | null = null
	): Promise<ProductToAttributeId> {
		const repository = this.getRepository(manager);

		const recordId = (
			(
				await repository
					.createQueryBuilder()
					.insert()
					.into(ProductToAttribute)
					.values(dto)
					.execute()
			).identifiers as ProductToAttributeId[]
		)[0];

		return recordId;
	}

	async deleteManyByProductId(
		productId: ProductIdType,
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.getRepository(manager);

		await repository
			.createQueryBuilder()
			.delete()
			.from(ProductToAttribute)
			.where('productId = :productId', { productId })
			.execute();
	}

	private getRepository(
		manager: EntityManager | null = null
	): Repository<ProductToAttribute> {
		const repository = manager
			? manager.getRepository(ProductToAttribute)
			: this.productToAttributeRepository;

		return repository;
	}
}
