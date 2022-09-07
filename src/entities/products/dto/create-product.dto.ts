import { IAttributesData } from '../types/attributes-data.interface';

export class CreateProductDto {
	readonly product_name: string;
	readonly description: string;
	readonly price: number;
	readonly quantity: number;
	readonly isActive: boolean;

	readonly category: string;
	readonly vendor: string;
	readonly attributes: IAttributesData;
}
