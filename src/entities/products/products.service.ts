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

@Injectable()
export class ProductsService {
	private readonly productUniqueFieldsToCheck: Partial<ProductUniqueFields>[] =
		[{ product_name: '' }];

	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		private entitiesService: EntitiesService,
		private photosService: PhotosService
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
		await this.findProductDublicate<CreateProductDto>(productDto);
		const newProduct = this.productRepository.create(productDto);

		const productPhotos: Photo[] = [];
		for (const file of files) {
			productPhotos.push(await this.photosService.createPhoto(file));
		}
		newProduct.photos = productPhotos;

		return this.productRepository.save(newProduct);
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
