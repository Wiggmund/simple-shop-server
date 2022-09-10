import { Attribute } from '../../../entities/attributes/entity/attribute.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_to_attribute')
export class ProductToAttribute {
	@PrimaryColumn()
	productId: number;

	@PrimaryColumn()
	attributeId: number;

	@ManyToOne(() => Product, (product) => product.productToAttributes)
	product: Product;

	@ManyToOne(() => Attribute, (attribute) => attribute.productToAttributes)
	attribute: Attribute;

	@Column()
	value: string;
}
