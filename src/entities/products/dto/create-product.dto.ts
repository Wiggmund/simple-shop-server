import { ProductCreationDataDto } from './product-creation-data.dto';

export class CreateProductDto {
	readonly product_name: string;
	readonly description: string;
	readonly price: number;
	readonly quantity: number;
	readonly isActive: boolean;

	constructor(dto: ProductCreationDataDto) {
		this.product_name = dto.product_name;
		this.description = dto.description;
		this.price = dto.price;
		this.quantity = dto.quantity;
		this.isActive = dto.isActive;
	}
}
