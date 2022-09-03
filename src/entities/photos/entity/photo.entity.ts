import { Product } from 'src/entities/products/entity/product.entity';
import { User } from 'src/entities/users/entity/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	url: string;

	@Column()
	type: string;

	@Column()
	size: number;

	@ManyToOne(() => User, (user) => user.photos)
	user: User;

	@ManyToOne(() => Product, (product) => product.photos)
	product: Product;
}
