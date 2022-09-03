import { Product } from 'src/entities/products/entity/product.entity';
import { User } from 'src/entities/users/entity/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	content: string;

	@ManyToOne(() => User, (user) => user.comments)
	user: User;

	@ManyToOne(() => Product, (product) => product.comments)
	product: Product;
}
