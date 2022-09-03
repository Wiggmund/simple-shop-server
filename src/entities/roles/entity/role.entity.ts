import { User } from 'src/entities/users/entity/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	value: string;

	@Column()
	description: string;

	@ManyToMany(() => User, (user) => user.roles)
	users: User[];
}
