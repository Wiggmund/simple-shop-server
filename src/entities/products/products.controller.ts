import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UploadedFiles,
	UseInterceptors
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('products')
export class ProductsController {
	constructor(private productsService: ProductsService) {}

	@Get()
	getAllProducts() {
		return this.productsService.getAllProducts();
	}

	@Get(':id')
	getProductById(@Param('id') id: number) {
		return this.productsService.getProductById(id);
	}

	@Post()
	@UseInterceptors(FilesInterceptor('productPhotos'))
	createProduct(
		@UploadedFiles() files: Array<Express.Multer.File>,
		@Body() productDto: CreateProductDto
	) {
		return this.productsService.createProduct(productDto, files);
	}

	@Put(':id')
	updateProduct(
		@Body() productDto: UpdateProductDto,
		@Param('id') id: number
	) {
		return this.productsService.updateProduct(productDto, id);
	}

	@Delete(':id')
	deleteProduct(@Param('id') id: number) {
		return this.productsService.deleteProduct(id);
	}
}
