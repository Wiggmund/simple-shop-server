import { User } from '../entity/user.entity';

export type UserUniqueFields = Pick<
	User,
	'firstName' | 'lastName' | 'email' | 'phone'
>;
