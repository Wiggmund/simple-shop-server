import { Attribute } from '../../../entities/attributes/entity/attribute.entity';
import { Product } from '../entity/product.entity';

export class CreateProductToAttributeDto {
	attribute: Attribute;
	product: Product;
	value: string;
}
