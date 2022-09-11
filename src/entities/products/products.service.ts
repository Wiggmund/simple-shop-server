import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductUniqueFields } from './types/productc-unique-fields.interface';
import { PhotosService } from '../photos/photos.service';
import { Express } from 'express';
import { Photo } from '../photos/entity/photo.entity';
import { CategoriesService } from '../categories/categories.service';
import { VendorsService } from '../vendors/vendors.service';
import { AttributesService } from '../attributes/attributes.service';
import { FileSystemService } from '../../file-system/file-system.service';
import { ProductToAttributeService } from './product-to-attribute.service';
import { ProductCreationDataDto } from './dto/product-creation-data.dto';
import { ProductIdentifier } from './types/product-identifier.interface';
import { IAttributesIdsValues } from './types/attributes-ids-values.interface';

@Injectable()
export class ProductsService {
	private readonly productUniqueFieldsToCheck: Partial<ProductUniqueFields>[] =
		[{ product_name: '' }];

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
		private dataSource: DataSource
	) {}

	async getAllProducts(): Promise<Product[]> {
		return this.productRepository.find();
	}

	async getProductById(id: number): Promise<Product> {
		return this.productRepository.findOne({ where: { id } });
	}

	async createProduct(
		productDto: ProductCreationDataDto,
		files: Array<Express.Multer.File>
	): Promise<Product> {
		try {
			await this.findProductDublicate<CreateProductDto>(productDto);

			const category = await this.categoriesService.getCategoryByName(
				productDto.category
			);

			const vendor = await this.vendorsService.getVendorByCompanyName(
				productDto.vendor
			);

			const attrs: IAttributesIdsValues[] = [];
			for (const attribute_name of Object.keys(productDto.attributes)) {
				const attributeId = (
					await this.attributesService.getAttributeByName(
						attribute_name
					)
				).id;
				const value = productDto.attributes[attribute_name];
				attrs.push({ attributeId, value });
			}

			const photos: Photo[] = [];
			for (const file of files) {
				photos.push(await this.photosService.createPhoto(file));
			}

			const productId = (
				(
					await this.productRepository
						.createQueryBuilder()
						.insert()
						.into(Product)
						.values(new CreateProductDto(productDto))
						.execute()
				).identifiers as ProductIdentifier[]
			)[0].id;

			await this.productRepository
				.createQueryBuilder()
				.relation(Product, 'category')
				.of(productId)
				.set(category);

			await this.productRepository
				.createQueryBuilder()
				.relation(Product, 'vendor')
				.of(productId)
				.set(vendor);

			await this.productRepository
				.createQueryBuilder()
				.relation(Product, 'photos')
				.of(productId)
				.add(photos);

			for (const { attributeId, value } of attrs) {
				await this.productToAttributeService.createProductToAttributeRecord(
					{
						attributeId,
						productId,
						value
					}
				);
			}

			return await this.productRepository
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
		} catch (e) {
			files.forEach((file) =>
				this.fileSystemService.deletePhotoFile(file.filename)
			);

			throw e;
		}
	}

	async updateProduct(
		productDto: UpdateProductDto,
		id: number
	): Promise<Product> {
		await this.entitiesService.isExist<Product>(
			[{ id }],
			this.productRepository
		);
		await this.findProductDublicate<UpdateProductDto>(productDto);

		await this.productRepository.update(id, productDto);
		// Get updated data about product and return it
		return await this.getProductById(id);
	}

	async deleteProduct(id: number): Promise<Product> {
		const product = await this.entitiesService.isExist<Product>(
			[{ id }],
			this.productRepository
		);
		await this.productToAttributeService.deleteManyByCreteria([
			{ product }
		]);
		await this.photosService.deleteManyPhotosByCriteria([{ product }]);
		await this.productRepository.delete(id);
		return product;
	}

	private async findProductDublicate<D>(productDto: D): Promise<Product> {
		return await this.entitiesService.checkForDublicates2<D, Product>(
			productDto,
			this.productUniqueFieldsToCheck,
			this.productRepository
		);
	}
}
