import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';
import { EntityManager, Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { CreateProductToAttributeDto } from './dto/create-product-to-attribute.dto';
import { ProductToAttribute } from './entity/product-to-attribute.entity';
import { ProductIdType } from './types/product-id.interface';
import { ProductToAttributeId } from './types/product-to-attribute-id.interface';

@Injectable()
export class ProductToAttributeService {
	constructor(
		@InjectRepository(ProductToAttribute)
		private productToAttributeRepository: Repository<ProductToAttribute>,
		private entitiesService: EntitiesService
	) {}

	async createProductToAttributeRecord(
		dto: CreateProductToAttributeDto,
		manager: EntityManager | null = null
	): Promise<ProductToAttributeId> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productToAttributeRepository,
			AvailableEntitiesEnum.ProductToAttribute
		);

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
		const repository = this.entitiesService.getRepository(
			manager,
			this.productToAttributeRepository,
			AvailableEntitiesEnum.ProductToAttribute
		);

		await repository
			.createQueryBuilder()
			.delete()
			.from(ProductToAttribute)
			.where('productId = :productId', { productId })
			.execute();
	}
}
