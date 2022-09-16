import { RolesEnum } from './../../common/enums/roles.enum';
import { JwtRolesGuard } from './../../common/guards/jwt-role.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UploadedFiles,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ProductCreationDataDto } from './dto/product-creation-data.dto';
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';
import { Roles } from '../../common/decorators/role.decorator';

@Roles(RolesEnum.Admin)
@UseGuards(JwtRolesGuard)
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
		@Body(DtoValidationPipe) productDto: ProductCreationDataDto
	) {
		return this.productsService.createProduct(productDto, files);
	}

	@Put(':id')
	updateProduct(
		@Body(DtoValidationPipe) productDto: UpdateProductDto,
		@Param('id') id: number
	) {
		return this.productsService.updateProduct(productDto, id);
	}

	@Delete(':id')
	deleteProduct(@Param('id') id: number) {
		return this.productsService.deleteProduct(id);
	}
}
