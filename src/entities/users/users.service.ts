import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { UserUniqueFields } from './types/user-unique-fields.interface';

@Injectable()
export class UsersService {
	private fieldsToSelect: Record<string, any> = {
		id: true,
		firstName: true,
		lastName: true,
		birthday: true,
		email: true,
		phone: true,
		isActivated: true
	};

	constructor(
		@InjectRepository(User) private userRepository: Repository<User>
	) {}

	async getAllUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async getUserById(id: number): Promise<User> {
		const candidate = await this.userRepository.findOne({ where: { id } });

		if (!candidate) {
			throw new HttpException(
				'User with given id not found',
				HttpStatus.NOT_FOUND
			);
		}

		return candidate;
	}

	async createUser(userDto: CreateUserDto): Promise<User> {
		await this.checkForDublicates({
			email: userDto.email,
			phone: userDto.phone
		});

		const newUser = await this.userRepository.create(userDto);
		return this.userRepository.save(newUser);
	}

	async updateUser(userDto: UpdateUserDto): Promise<User> {
		const { id, ...propsToUpdate } = userDto;

		// Check for existence
		await this.getUserById(id);

		await this.checkForDublicates({
			email: '',
			phone: userDto.phone
		});
		await this.userRepository.update(id, propsToUpdate);

		const freshUser = await this.getUserById(id);
		return freshUser;
	}

	async removeUser(userDto: DeleteUserDto): Promise<User> {
		const user = await this.getUserById(userDto.id);
		await this.userRepository.delete(user.id);
		return user;
	}

	async getUserByEmail(email: string): Promise<User> {
		const candidate = await this.userRepository.findOne({
			where: { email }
		});

		if (!candidate) {
			throw new HttpException(
				'User with given email not found',
				HttpStatus.NOT_FOUND
			);
		}

		return candidate;
	}

	private async checkForDublicates(unique: UserUniqueFields): Promise<void> {
		const candidate = await this.userRepository.findOne({
			where: [{ email: unique.email }, { phone: unique.phone }]
		});

		if (candidate) {
			const dublicatedField =
				candidate.email === unique.email ? 'email' : 'phone';

			throw new HttpException(
				`User with given ${dublicatedField} already exists`,
				HttpStatus.BAD_REQUEST
			);
		}
	}
}
