import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { CreateProductToAttributeDto } from './dto/create-product-to-attribute.dto';
import { ProductToAttribute } from './entity/product-to-attribute.entity';
import { ProductIdType } from './types/product-id.interface';
import { ProductToAttributeId } from './types/product-to-attribute-id.interface';
import { Product } from './entity/product.entity';
import { AddProductAttributeDto } from './dto/add-product-attribute.dto';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { AttributesService } from '../attributes/attributes.service';
import { EntityDuplicateException } from '../../common/exceptions/entity-duplicate.exception';
import { DeleteProductAttributeDto } from './dto/delete-product-attribute.dto';
import { AttributeIdType } from '../attributes/types/attribute-id.interface';
import { ProductsService } from './products.service';
import { Attribute } from '../attributes/entity/attribute.entity';

@Injectable()
export class ProductToAttributeService {
	constructor(
		@InjectRepository(ProductToAttribute)
		private productToAttributeRepository: Repository<ProductToAttribute>,

		@InjectRepository(Product)
		private productRepository: Repository<Product>,

		private entitiesService: EntitiesService,
		private attributesService: AttributesService,

		@Inject(forwardRef(() => ProductsService))
		private productsService: ProductsService
	) {}

	async getRecordById(
		productId: ProductIdType,
		attributeId: AttributeIdType,
		manager: EntityManager | null = null
	): Promise<ProductToAttribute> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productToAttributeRepository,
			ProductToAttribute
		);

		await this.productsService.getProductById(productId);
		await this.attributesService.getAttributeById(attributeId, manager);

		const candidate = await repository
			.createQueryBuilder('prodToAttr')
			.where('prodToAttr.productId = :productId', { productId })
			.andWhere('prodToAttr.attributeId = :attributeId', { attributeId })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`ProductToAttribute record with given productId=${productId} and attributeId=${attributeId} not found`
			);
		}

		return candidate;
	}

	async createProductToAttributeRecord(
		dto: CreateProductToAttributeDto,
		manager: EntityManager | null = null
	): Promise<ProductToAttributeId> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productToAttributeRepository,
			ProductToAttribute
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
			ProductToAttribute
		);

		await repository
			.createQueryBuilder()
			.delete()
			.from(ProductToAttribute)
			.where('productId = :productId', { productId })
			.execute();
	}

	async deleteOneRecord(
		productId: ProductIdType,
		attributeId: AttributeIdType,
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productToAttributeRepository,
			ProductToAttribute
		);

		await repository
			.createQueryBuilder()
			.delete()
			.from(ProductToAttribute)
			.where('productId = :productId', { productId })
			.andWhere('attributeId = :attributeId', { attributeId })
			.execute();
	}

	async getProductAttributes(
		productId: ProductIdType,
		manager: EntityManager | null = null
	): Promise<ProductToAttribute[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productRepository,
			Product
		);

		await this.checkProductAndAttributeExistence(
			productId,
			null,
			repository
		);

		return repository
			.createQueryBuilder()
			.relation(Product, 'productToAttributes')
			.of(productId)
			.loadMany();
	}

	async addProductAttribute(
		productId: ProductIdType,
		dto: AddProductAttributeDto,
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productRepository,
			Product
		);

		const { id: attributeId } =
			await this.checkProductAndAttributeExistence(
				productId,
				dto.attribute_name,
				repository
			);

		await this.findDuplicatedProductToAttributeRecord(
			[{ productId, attributeId }],
			manager
		);

		await this.createProductToAttributeRecord(
			{
				productId,
				attributeId,
				value: dto.value
			},
			manager
		);
	}

	async updateProductAttribute(
		productId: ProductIdType,
		dto: AddProductAttributeDto,
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productToAttributeRepository,
			ProductToAttribute
		);
		const productRepository = this.entitiesService.getRepository(
			manager,
			this.productRepository,
			Product
		);

		const { id: attributeId } =
			await this.checkProductAndAttributeExistence(
				productId,
				dto.attribute_name,
				productRepository
			);

		await this.getRecordById(productId, attributeId, manager);

		await repository
			.createQueryBuilder()
			.update(ProductToAttribute)
			.set({ value: dto.value })
			.where('productId = :productId', { productId })
			.andWhere('attributeId = :attributeId', { attributeId })
			.execute();
	}

	async deleteProductAttributes(
		productId: ProductIdType,
		dto: DeleteProductAttributeDto,
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productRepository,
			Product
		);

		const { id: attributeId } =
			await this.checkProductAndAttributeExistence(
				productId,
				dto.attribute_name,
				repository
			);

		await this.deleteOneRecord(productId, attributeId, manager);
	}

	private async checkProductAndAttributeExistence(
		productId: ProductIdType,
		attribute_name: string,
		repository: Repository<Product>
	): Promise<Attribute | null> {
		await this.entitiesService.isExist<Product>(
			repository.manager,
			{ id: productId },
			Product
		);

		if (attribute_name) {
			const attribute = await this.attributesService.getAttributeByName(
				attribute_name,
				repository.manager
			);

			return attribute;
		}

		return null;
	}

	private async findDuplicatedProductToAttributeRecord(
		filter: FindOptionsWhere<ProductToAttribute>[],
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productToAttributeRepository,
			ProductToAttribute
		);

		const candidate = await repository.findOne({
			select: { productId: true, value: true },
			where: filter
		});

		if (candidate) {
			const { productId, value } = candidate;
			throw new EntityDuplicateException(
				`Product with given id=${productId} already has this attribute with value ${value}`
			);
		}
	}
}
