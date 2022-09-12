import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import {
	DataSource,
	EntityManager,
	FindOptionsWhere,
	Repository
} from 'typeorm';

import { User } from './entity/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserUniqueFields } from './types/user-unique-fields.interface';
import { IUserID } from './types/user-id.interface';
import { TransactionKit } from 'src/common/types/transaction-kit.interface';

import { EntitiesService } from '../entities.service';
import { PhotosService } from '../photos/photos.service';
import { FileSystemService } from '../../file-system/file-system.service';

@Injectable()
export class UsersService {
	private readonly userUniqueFieldsToCheck: FindOptionsWhere<UserUniqueFields>[] =
		[{ firstName: '', lastName: '' }, { email: '' }, { phone: '' }];

	private uniqueFields: string[] = this.userUniqueFieldsToCheck
		.map((option) => Object.keys(option))
		.flat();

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private entitiesService: EntitiesService,
		private photosService: PhotosService,
		private fileSystemService: FileSystemService,
		private dataSource: DataSource
	) {}

	async getAllUsers(manager: EntityManager | null = null): Promise<User[]> {
		const repository = this.getRepository(manager);
		return repository.createQueryBuilder('user').getMany();
	}

	async getUserById(
		id: number,
		manager: EntityManager | null = null
	): Promise<User> {
		const repository = this.getRepository(manager);

		return repository
			.createQueryBuilder('user')
			.where('user.id = :id', { id })
			.getOne();
	}

	async createUser(
		userDto: CreateUserDto,
		file: Express.Multer.File
	): Promise<User> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.findUserDublicate<UpdateUserDto>(
				null,
				userDto,
				repository
			);

			const userId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(User)
						.values(userDto)
						.execute()
				).identifiers as IUserID[]
			)[0].id;

			if (file) {
				const avatar = await this.photosService.createPhoto(
					file,
					queryRunner.manager
				);

				await repository
					.createQueryBuilder()
					.relation(User, 'photos')
					.of(userId)
					.add(avatar.id);
			}

			const savedUser = await repository
				.createQueryBuilder('user')
				.leftJoinAndSelect('user.photos', 'photo')
				.where('user.id = :userId', { userId })
				.getOne();

			await queryRunner.commitTransaction();
			return savedUser;
		} catch (err) {
			await queryRunner.rollbackTransaction();
			this.fileSystemService.deletePhotoFile(file.filename);

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async updateUser(userDto: UpdateUserDto, id: number): Promise<User> {
		const { queryRunner, repository, manager } =
			this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const user = await this.entitiesService.isExist<User>(
				[{ id }],
				repository
			);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateUserDto>(
					userDto,
					this.uniqueFields
				)
			) {
				await this.findUserDublicate<UpdateUserDto>(
					user,
					userDto,
					repository
				);
			}

			await repository
				.createQueryBuilder()
				.update(User)
				.set(userDto)
				.where('id = :id', { id })
				.execute();

			const updatedUser = await this.getUserById(id, manager);

			await queryRunner.commitTransaction();
			return updatedUser;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteUser(id: number): Promise<User> {
		const { queryRunner, repository, manager } =
			this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const user = await this.entitiesService.isExist<User>(
				[{ id }],
				repository
			);

			await this.photosService.deleteManyPhotosByCriteria(
				[{ user }],
				queryRunner.manager
			);

			await this.photosService.deleteManyPhotos('user', id, manager);

			await repository
				.createQueryBuilder()
				.delete()
				.from(User)
				.where('id = :id', { id })
				.execute();

			await queryRunner.commitTransaction();
			return user;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	private async findUserDublicate<D>(
		user: User,
		userDto: D,
		repository: Repository<User>
	): Promise<void> {
		const findOptions =
			this.entitiesService.getFindOptionsToFindDublicates<User>(
				user,
				userDto,
				this.userUniqueFieldsToCheck
			);

		return await this.entitiesService.checkForDublicates<User>(
			repository,
			findOptions,
			'User'
		);
	}

	private getQueryRunnerAndRepository(): TransactionKit<User> {
		const queryRunner = this.dataSource.createQueryRunner();
		const manager = queryRunner.manager;
		const repository = manager.getRepository(User);

		return { queryRunner, repository, manager };
	}

	private getRepository(
		manager: EntityManager | null = null
	): Repository<User> {
		const repository = manager
			? manager.getRepository(User)
			: this.userRepository;

		return repository;
	}
}
