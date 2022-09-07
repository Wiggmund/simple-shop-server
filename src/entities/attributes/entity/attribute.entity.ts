import { Product } from '../../products/entity/product.entity';
import {
	Column,
	Entity,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm';
import { ProductToAttribute } from '../../../entities/products/entity/product-to-attribute.entity';

@Entity('attributes')
export class Attribute {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	attribute_name: string;

	@OneToMany(
		() => ProductToAttribute,
		(productToAttribute) => productToAttribute.attribute
	)
	productToAttributes: Attribute[];
}
