import { Comment } from 'src/entities/comments/entity/comment.entity';
import { Photo } from 'src/entities/photos/entity/photo.entity';
import { Role } from 'src/entities/roles/entity/role.entity';
import { Transaction } from 'src/entities/transactions/entity/transaction.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm';

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

	@OneToMany(() => Comment, (comment) => comment.user)
	comments: Comment[];

	@OneToMany(() => Transaction, (transaction) => transaction.user)
	transactions: Transaction[];

	@ManyToMany(() => Role, (role) => role.users)
	@JoinTable()
	roles: Role[];
}
