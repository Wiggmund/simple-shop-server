import { Photo } from 'src/entities/photos/entity/photo.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

	// Relations

	@OneToMany(() => Photo, (photo) => photo.user)
	photos: Photo[];
}
