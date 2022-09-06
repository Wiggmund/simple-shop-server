import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserUniqueFields } from './types/user-unique-fields.interface';
import { Express } from 'express';
import { PhotosService } from '../photos/photos.service';

@Injectable()
export class UsersService {
	private readonly uniqueFieldsToCheck: FindOptionsWhere<UserUniqueFields>[] =
		[{ firstName: '', lastName: '' }, { email: '' }, { phone: '' }];

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private entitiesService: EntitiesService,
		private photosService: PhotosService
	) {}

	async getAllUsers(): Promise<User[]> {
		return this.userRepository.find({ relations: { photos: true } });
	}

	async getUserById(id: number): Promise<User> {
		return this.userRepository.findOne({ where: { id } });
	}

	async createUser(
		userDto: CreateUserDto,
		file: Express.Multer.File
	): Promise<User> {
		await this.findUserDublicate<CreateUserDto>(userDto);

		const newUser = this.userRepository.create(userDto);
		if (file) {
			const avatar = await this.photosService.createPhoto(file);
			newUser.photos = [avatar];
		}

		return this.userRepository.save(newUser);
	}

	async updateUser(userDto: UpdateUserDto, id: number): Promise<User> {
		await this.entitiesService.isExist<User>([{ id }], this.userRepository);
		await this.findUserDublicate<UpdateUserDto>(userDto);

		await this.userRepository.update(id, userDto);
		// Get updated data about user and return it
		return await this.getUserById(id);
	}

	async deleteUser(id: number): Promise<User> {
		const user = await this.entitiesService.isExist<User>(
			[{ id }],
			this.userRepository
		);
		await this.photosService.deleteManyPhotosByCriteria([{ user }]);
		await this.userRepository.delete(id);
		return user;
	}

	private async findUserDublicate<D>(userDto: D): Promise<User> {
		return await this.entitiesService.checkForDublicates<D, User>(
			userDto,
			this.uniqueFieldsToCheck,
			this.userRepository
		);
	}
}
