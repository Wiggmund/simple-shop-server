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

	@Column({ nullable: true })
	productId: number;

	@Column({ nullable: true })
	userId: number;

	@ManyToOne(() => User, (user) => user.transactions)
	user: User;

	@ManyToOne(() => Product, (product) => product.transactions)
	product: Product;
}
