import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	// Personal data

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column('timestamp')
	birthday: number;

	// Registration data

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ unique: true })
	phone: string;

	@Column()
	isActivated: boolean;

	@Column({ unique: true })
	activationLink: string;
}
