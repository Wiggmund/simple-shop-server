import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attribute {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	attribute_name: string;
}
