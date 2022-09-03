import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
