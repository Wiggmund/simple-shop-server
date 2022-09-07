import { Comment } from '../../comments/entity/comment.entity';
import { Photo } from '../../photos/entity/photo.entity';
import { Role } from '../../roles/entity/role.entity';
import { Transaction } from '../../transactions/entity/transaction.entity';
import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn
} from 'typeorm';
import { RefreshToken } from 'src/entities/refreshTokens/entity/refresh-token.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	// Personal data

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	birthday: string;

	// Registration data

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ unique: true })
	phone: string;

	@Column({
		default: false,
		nullable: true
	})
	isActivated: boolean;

	@Column({
		unique: true,
		nullable: true
	})
	activationLink: string;

	// Relations

	@OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
	@JoinColumn()
	token: RefreshToken;

	@OneToMany(() => Photo, (photo) => photo.user)
	photos: Photo[];

	@OneToMany(() => Comment, (comment) => comment.user)
	comments: Comment[];

	@OneToMany(() => Transaction, (transaction) => transaction.user)
	transactions: Transaction[];

	@ManyToMany(() => Role, (role) => role.users)
	@JoinTable()
	roles: Role[];
}
