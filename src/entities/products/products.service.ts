import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';

import { Product } from './entity/product.entity';
import { Photo } from '../photos/entity/photo.entity';
import { Comment } from '../comments/entity/comment.entity';
import { Transaction } from '../transactions/entity/transaction.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCreationDataDto } from './dto/product-creation-data.dto';

import { EntitiesService } from '../entities.service';
import { PhotosService } from '../photos/photos.service';
import { CategoriesService } from '../categories/categories.service';
import { VendorsService } from '../vendors/vendors.service';
import { AttributesService } from '../attributes/attributes.service';
import { FileSystemService } from '../../file-system/file-system.service';
import { ProductToAttributeService } from './product-to-attribute.service';
import { CommentsService } from '../comments/comments.service';

import { ProductId, ProductIdType } from './types/product-id.interface';
import { IAttributeIdAndValue } from '../attributes/types/attribute-id-and-value.interface';
import { PhotoIdType } from '../photos/types/photo-id.interface';
import {
	ProductUniqueConditions,
	ProductUniqueFields
} from './types/product-unique-conditions.interface';
import { IProductRelatedEntitiesIds } from './types/product-related-entities-ids.interface';

import { TransactionsService } from '../transactions/transactions.service';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';

@Injectable()
export class ProductsService {
	private readonly productUniqueFieldsToCheck: FindOptionsWhere<ProductUniqueConditions>[] =
		[{ product_name: '' }];

	private uniqueFields: ProductUniqueFields[] =
		this.productUniqueFieldsToCheck
			.map((option) => Object.keys(option) as ProductUniqueFields[])
			.flat();

	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		private entitiesService: EntitiesService,
		private photosService: PhotosService,
		private categoriesService: CategoriesService,
		private vendorsService: VendorsService,
		private attributesService: AttributesService,
		private fileSystemService: FileSystemService,
		private productToAttributeService: ProductToAttributeService,
		private commentsService: CommentsService,
		private transactionsService: TransactionsService
	) {}

	async getAllProducts(
		manager: EntityManager | null = null
	): Promise<Product[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productRepository,
			AvailableEntitiesEnum.Product
		);

		return repository.createQueryBuilder('product').getMany();
	}

	async getProductById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Product> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.productRepository,
			AvailableEntitiesEnum.Product
		);

		return repository
			.createQueryBuilder('product')
			.where('product.id = :id', { id })
			.getOne();
	}

	async createProduct(
		productCreationDataDto: ProductCreationDataDto,
		files: Array<Express.Multer.File>
	): Promise<Product> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Product>(
				AvailableEntitiesEnum.Product
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const productDto = new CreateProductDto(productCreationDataDto);

			await this.entitiesService.findEntityDublicate<Product>(
				null,
				productDto,
				repository,
				this.productUniqueFieldsToCheck
			);

			/* 
				Getting related entities
			*/
			const category = await this.categoriesService.getCategoryByName(
				productCreationDataDto.category,
				manager
			);

			const vendor = await this.vendorsService.getVendorByCompanyName(
				productCreationDataDto.vendor,
				manager
			);

			const attributeKeys = Object.keys(
				productCreationDataDto.attributes
			);
			const attributeIdsAndValues: IAttributeIdAndValue[] = [];
			for (const attribute_name of attributeKeys) {
				const attributeId = (
					await this.attributesService.getAttributeByName(
						attribute_name,
						manager
					)
				).id;

				const value = productCreationDataDto.attributes[attribute_name];

				attributeIdsAndValues.push({ attributeId, value });
			}

			const photoIds: PhotoIdType[] = [];
			for (const file of files) {
				const photo = await this.photosService.createPhoto(
					file,
					manager
				);

				photoIds.push(photo.id);
			}

			/* 
				Product creation
			*/
			const productId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(Product)
						.values(productDto)
						.execute()
				).identifiers as ProductId[]
			)[0].id;

			/* 
				Adding relations for created product
			*/
			await repository
				.createQueryBuilder()
				.relation(Product, 'category')
				.of(productId)
				.set(category);

			await repository
				.createQueryBuilder()
				.relation(Product, 'vendor')
				.of(productId)
				.set(vendor);

			await repository
				.createQueryBuilder()
				.relation(Product, 'photos')
				.of(productId)
				.add(photoIds);

			for (const { attributeId, value } of attributeIdsAndValues) {
				await this.productToAttributeService.createProductToAttributeRecord(
					{
						attributeId,
						productId,
						value
					},
					manager
				);
			}

			/* 
				Getting created product with all related entities
			*/
			const createdProduct = await repository
				.createQueryBuilder('product')
				.leftJoinAndSelect('product.category', 'category')
				.leftJoinAndSelect('product.vendor', 'vendor')
				.leftJoinAndSelect('product.photos', 'photo')
				.leftJoinAndSelect(
					'product.productToAttributes',
					'productToAttribute'
				)
				.where('product.id = :id', { id: productId })
				.getOne();

			await queryRunner.commitTransaction();
			return createdProduct;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			files.forEach((file) =>
				this.fileSystemService.deletePhotoFile(file.filename)
			);

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async updateProduct(
		productDto: UpdateProductDto,
		id: number
	): Promise<Product> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Product>(
				AvailableEntitiesEnum.Product
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const product = await this.entitiesService.isExist<Product>(
				[{ id }],
				repository
			);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateProductDto>(
					productDto,
					this.uniqueFields
				)
			) {
				await this.entitiesService.findEntityDublicate<Product>(
					product,
					productDto,
					repository,
					this.productUniqueFieldsToCheck
				);
			}
			console.log('HERE');
			await repository
				.createQueryBuilder()
				.update(Product)
				.set(productDto)
				.where('id = :id', { id: product.id })
				.execute();

			const updatedProduct = await this.getProductById(id, manager);

			await queryRunner.commitTransaction();
			return updatedProduct;
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

	async deleteProduct(id: number): Promise<Product> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Product>(
				AvailableEntitiesEnum.Product
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const product = await this.entitiesService.isExist<Product>(
				[{ id }],
				repository
			);
			const { photosIds, commentsIds, transactionIds } =
				await this.getRelatedEntitiesIds(id, repository);

			await this.photosService.deleteManyPhotosByIds(photosIds, manager);

			await this.productToAttributeService.deleteManyByProductId(
				id,
				manager
			);

			await this.commentsService.unbindEntities(
				'product',
				commentsIds,
				manager
			);
			await this.transactionsService.unbindEntities(
				'product',
				transactionIds,
				manager
			);

			await repository
				.createQueryBuilder()
				.delete()
				.from(Product)
				.where('id = :id', { id })
				.execute();

			await queryRunner.commitTransaction();
			return product;
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

	private async getRelatedEntitiesIds(
		productId: ProductIdType,
		repository: Repository<Product>
	): Promise<IProductRelatedEntitiesIds> {
		const photosIds = (
			await repository
				.createQueryBuilder()
				.relation(Product, 'photos')
				.of(productId)
				.loadMany<Photo>()
		).map((photo) => photo.id);

		const commentsIds = (
			await repository
				.createQueryBuilder()
				.relation(Product, 'comments')
				.of(productId)
				.loadMany<Comment>()
		).map((comment) => comment.id);

		const transactionIds = (
			await repository
				.createQueryBuilder()
				.relation(Product, 'transactions')
				.of(productId)
				.loadMany<Transaction>()
		).map((transaction) => transaction.id);

		return { photosIds, commentsIds, transactionIds };
	}
}
