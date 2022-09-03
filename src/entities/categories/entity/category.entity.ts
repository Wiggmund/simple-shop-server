import { Product } from '../../products/entity/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	category_name: string;

	@OneToMany(() => Product, (product) => product.category)
	products: Product[];
}
