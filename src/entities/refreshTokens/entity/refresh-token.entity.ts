import { User } from 'src/entities/users/entity/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	token: string;

	@OneToOne(() => User, (user) => user.token)
	user: User;
}
