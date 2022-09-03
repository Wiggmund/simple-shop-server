import { Product } from '../../products/entity/product.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attributes')
export class Attribute {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	attribute_name: string;

	@ManyToMany(() => Product, (product) => product.attributes)
	products: Product[];
}
