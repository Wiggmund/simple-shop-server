import { IAttributesData } from '../../attributes/types/attributes-data.interface';

export class ProductCreationDataDto {
	readonly product_name: string;
	readonly description: string;
	readonly price: number;
	readonly quantity: number;
	readonly isActive: boolean;

	readonly category: string;
	readonly vendor: string;
	readonly attributes: IAttributesData;
}
