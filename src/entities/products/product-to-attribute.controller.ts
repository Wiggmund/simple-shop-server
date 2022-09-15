import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';
import { AddProductAttributeDto } from './dto/add-product-attribute.dto';
import { DeleteProductAttributeDto } from './dto/delete-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { ProductToAttributeService } from './product-to-attribute.service';
import { ProductIdType } from './types/product-id.interface';

@Controller('products')
export class ProductToAttributeController {
	constructor(private productToAttributeService: ProductToAttributeService) {}

	@Get(':id/attributes')
	getProductAttributes(@Param('id') id: ProductIdType) {
		return this.productToAttributeService.getProductAttributes(id);
	}

	@Post(':id/attributes')
	addProductAttribute(
		@Param('id') id: ProductIdType,
		@Body(DtoValidationPipe) dto: AddProductAttributeDto
	) {
		return this.productToAttributeService.addProductAttribute(id, dto);
	}

	@Put(':id/attributes')
	updateProductAttribute(
		@Param('id') id: ProductIdType,
		@Body(DtoValidationPipe) dto: UpdateProductAttributeDto
	) {
		return this.productToAttributeService.updateProductAttribute(id, dto);
	}

	@Delete(':id/attributes')
	deleteProductAttributes(
		@Param('id') id: ProductIdType,
		@Body(DtoValidationPipe) dto: DeleteProductAttributeDto
	) {
		return this.productToAttributeService.deleteProductAttributes(id, dto);
	}
}
