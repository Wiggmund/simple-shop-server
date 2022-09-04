import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IProductUniqueFields } from './types/productc-unique-fields.interface';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product) private productRepository: Repository<Product>,
		private entitiesService: EntitiesService
	) {}

	async getAllProducts(): Promise<Product[]> {
		return this.productRepository.find();
	}

	async getProductById(id: number): Promise<Product> {
		return this.productRepository.findOne({ where: { id } });
	}

	async createProduct(productDto: CreateProductDto): Promise<Product> {
		await this.entitiesService.checkForDublicates<
			CreateProductDto,
			IProductUniqueFields,
			Product
		>(productDto, { product_name: '' }, this.productRepository);

		const newProduct = this.productRepository.create(productDto);
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
		await this.entitiesService.checkForDublicates<
			UpdateProductDto,
			IProductUniqueFields,
			Product
		>(productDto, { product_name: '' }, this.productRepository);

		await this.productRepository.update(id, productDto);
		// Get updated data about product and return it
		return await this.getProductById(id);
	}

	async deleteProduct(id: number): Promise<Product> {
		const product = await this.entitiesService.isExist<Product>(
			[{ id }],
			this.productRepository
		);
		await this.productRepository.delete(id);
		return product;
	}
}
