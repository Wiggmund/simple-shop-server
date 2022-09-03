import { Product } from 'src/entities/products/entity/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vendor {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	company_name: string;

	@OneToMany(() => Product, (product) => product.vendor)
	products: Product[];
}
