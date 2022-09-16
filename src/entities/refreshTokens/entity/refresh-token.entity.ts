import { User } from '../../../entities/users/entity/user.entity';
import {
	Column,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn
} from 'typeorm';
import { UserIdType } from '../../users/types/user-id.interface';

@Entity('refresh_tokens')
export class RefreshToken {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	token: string;

	@Column()
	userId: UserIdType;

	@OneToOne(() => User, (user) => user.token)
	@JoinColumn()
	user: User;
}
