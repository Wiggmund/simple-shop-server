import { Attribute } from 'src/entities/attributes/entity/attribute.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_to_attribute')
export class ProductToAttribute {
	@ManyToOne(() => Product, (product) => product.productToAttributes)
	product: Product;

	@ManyToOne(() => Attribute, (attribute) => attribute.productToAttributes)
	attribute: Attribute;

	@Column()
	value: string;
}
