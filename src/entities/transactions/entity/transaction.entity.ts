import { Product } from '../../products/entity/product.entity';
import { User } from '../../users/entity/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('real')
	amount: number;

	@Column('float4')
	full_price: number;

	@Column()
	productId: number;

	@Column()
	userId: number;

	@ManyToOne(() => User, (user) => user.transactions)
	user: User;

	@ManyToOne(() => Product, (product) => product.transactions)
	product: Product;
}
