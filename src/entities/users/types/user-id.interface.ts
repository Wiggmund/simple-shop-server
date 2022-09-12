import { User } from '../entity/user.entity';

export type UserId = Pick<User, 'id'>;

const temp: UserId = {
	id: 1
};

type key = keyof UserId;

export type UserIdType = typeof temp[key];
