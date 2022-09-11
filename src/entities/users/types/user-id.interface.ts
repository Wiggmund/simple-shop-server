import { User } from '../entity/user.entity';

export interface IUserID {
	id: Pick<User, 'id'>;
}
