import { User } from 'src/entities/users/entity/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('real')
	amount: number;

	@Column('float4')
	full_price: number;

	@ManyToOne(() => User, (user) => user.transactions)
	user: User;
}
