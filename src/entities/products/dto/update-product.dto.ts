export class UpdateProductDto {
	readonly product_name: string;
	readonly description: string;
	readonly price: number;
	readonly quantity: number;
	readonly isActive: boolean;
}
