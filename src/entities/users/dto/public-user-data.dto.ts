import { User } from '../entity/user.entity';

export class PublicUserDataDto {
	id: number;
	firstName: string;
	lastName: string;
	birthday: string;
	email: string;
	phone: string;
	isActivated: boolean;

	constructor(user: User) {
		this.id = user.id;
		this.firstName = user.firstName;
		this.lastName = user.lastName;
		this.birthday = user.birthday;
		this.email = user.email;
		this.phone = user.phone;
		this.isActivated = user.isActivated;
	}
}
