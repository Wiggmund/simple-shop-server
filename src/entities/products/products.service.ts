import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { Attribute } from '../attributes/entity/attribute.entity';
import { FileSystemService } from '../../file-system/file-system.service';

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
		private fileSystemService: FileSystemService
	) {}

	async getAllProducts(): Promise<Product[]> {
		return this.productRepository.find();
	}

	async getProductById(id: number): Promise<Product> {
		return this.productRepository.findOne({ where: { id } });
	}

	async createProduct(
		productDto: CreateProductDto,
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

			const attributes: Attribute[] = [];
			for (const attribute_name of productDto.attributes) {
				attributes.push(
					await this.attributesService.getAttributeByName(
						attribute_name
					)
				);
			}

			const photos: Photo[] = [];
			for (const file of files) {
				photos.push(await this.photosService.createPhoto(file));
			}

			const newProduct = this.productRepository.create({
				...productDto,
				category,
				vendor,
				attributes,
				photos
			});

			return this.productRepository.save(newProduct);
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
		await this.photosService.deleteManyPhotosByCriteria([{ product }]);
		await this.productRepository.delete(id);
		return product;
	}

	private async findProductDublicate<D>(productDto: D): Promise<Product> {
		return await this.entitiesService.checkForDublicates<D, Product>(
			productDto,
			this.productUniqueFieldsToCheck,
			this.productRepository
		);
	}
}
