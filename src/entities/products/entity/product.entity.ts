import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	product_name: string;

	@Column()
	description: string;

	@Column('float4')
	price: number;

	@Column()
	quantity: number;

	@Column()
	isActive: boolean;
}
