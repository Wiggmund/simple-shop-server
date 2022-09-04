import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserUniqueFields } from './types/user-unique-fields.interface';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private entitiesService: EntitiesService
	) {}

	async getAllUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async getUserById(id: number): Promise<User> {
		return this.userRepository.findOne({ where: { id } });
	}

	async createUser(userDto: CreateUserDto): Promise<User> {
		await this.entitiesService.checkForDublicates<
			CreateUserDto,
			IUserUniqueFields,
			User
		>(userDto, { email: '', phone: '' }, this.userRepository);

		const newUser = this.userRepository.create(userDto);
		return this.userRepository.save(newUser);
	}

	async updateUser(userDto: UpdateUserDto, id: number): Promise<User> {
		await this.entitiesService.isExist<User>([{ id }], this.userRepository);
		await this.entitiesService.checkForDublicates<
			UpdateUserDto,
			IUserUniqueFields,
			User
		>(userDto, { email: '', phone: '' }, this.userRepository);

		await this.userRepository.update(id, userDto);
		// Get updated data about user and return it
		return await this.getUserById(id);
	}

	async deleteUser(id: number): Promise<User> {
		const user = await this.entitiesService.isExist<User>(
			[{ id }],
			this.userRepository
		);
		await this.userRepository.delete(id);
		return user;
	}
}
