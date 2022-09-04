import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
	createProduct(@Body() productDto: CreateProductDto) {
		return this.productsService.createProduct(productDto);
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
