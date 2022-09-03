import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vendor {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	company_name: string;
}
