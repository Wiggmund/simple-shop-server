import { User } from '../entity/user.entity';

export class UserPayloadDto {
	id: number;
	roles: string[];

	constructor(user: User, roles: string[]) {
		this.id = user.id;
		this.roles = roles;
	}
}
