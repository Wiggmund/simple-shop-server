import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('real')
	amount: number;

	@Column('float4')
	full_price: number;
}
