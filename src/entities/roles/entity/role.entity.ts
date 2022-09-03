import { User } from '../../users/entity/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
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
