import { Product } from 'src/entities/products/entity/product.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attribute {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	attribute_name: string;

	@ManyToMany(() => Product, (product) => product.attributes)
	products: Product[];
}
