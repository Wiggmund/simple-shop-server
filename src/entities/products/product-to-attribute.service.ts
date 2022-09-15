import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';
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
			AvailableEntitiesEnum.ProductToAttribute
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

	async deleteOneRecord(
		productId: ProductIdType,
		attributeId: AttributeIdType,
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
			AvailableEntitiesEnum.Product
		);

		await this.checkProductExistence(productId, repository);

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
			AvailableEntitiesEnum.Product
		);

		await this.checkProductExistence(productId, repository);

		const attribute = await this.attributesService.getAttributeByName(
			dto.attribute_name,
			manager
		);
		const [{ id: attributeId }, { value }] = [attribute, dto];

		await this.findDuplicatedProductToAttributeRecord(
			[{ productId, attributeId }],
			manager
		);

		await this.createProductToAttributeRecord(
			{
				productId,
				attributeId,
				value
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
			AvailableEntitiesEnum.ProductToAttribute
		);
		const productRepository = this.entitiesService.getRepository(
			manager,
			this.productRepository,
			AvailableEntitiesEnum.Product
		);

		await this.checkProductExistence(productId, productRepository);
		const attribute = await this.attributesService.getAttributeByName(
			dto.attribute_name,
			manager
		);
		const [{ id: attributeId }, { value }] = [attribute, dto];

		await this.getRecordById(productId, attributeId, manager);

		await repository
			.createQueryBuilder()
			.update(ProductToAttribute)
			.set({ value })
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
			AvailableEntitiesEnum.Product
		);

		await this.checkProductExistence(productId, repository);

		const attribute = await this.attributesService.getAttributeByName(
			dto.attribute_name,
			manager
		);

		await this.deleteOneRecord(productId, attribute.id, manager);
	}

	private async checkProductExistence(
		productId: ProductIdType,
		repository: Repository<Product>
	): Promise<void> {
		const isProduct = await this.entitiesService.isExist<Product>(
			repository,
			{
				id: productId
			}
		);
		if (!isProduct) {
			throw new EntityNotFoundException(
				`Product with given id=${productId} not found`
			);
		}
	}

	private async findDuplicatedProductToAttributeRecord(
		filter: FindOptionsWhere<ProductToAttribute>[],
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productToAttributeRepository,
			AvailableEntitiesEnum.ProductToAttribute
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
