import { Attribute } from '../../../entities/attributes/entity/attribute.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_to_attribute')
export class ProductToAttribute {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	productId: number;

	@Column()
	attributeId: number;

	@ManyToOne(() => Product, (product) => product.productToAttributes)
	product: Product;

	@ManyToOne(() => Attribute, (attribute) => attribute.productToAttributes)
	attribute: Attribute;

	@Column()
	value: string;
}
