import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DataSource,
	EntityManager,
	FindOptionsWhere,
	QueryRunner,
	Repository
} from 'typeorm';
import { EntitiesService } from '../entities.service';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserUniqueFields } from './types/user-unique-fields.interface';
import { Express } from 'express';
import { PhotosService } from '../photos/photos.service';
import { FileSystemService } from '../../file-system/file-system.service';
import { IUserID } from './types/user-id.interface';

@Injectable()
export class UsersService {
	private readonly uniqueConditions: FindOptionsWhere<UserUniqueFields>[] = [
		{ firstName: '', lastName: '' },
		{ email: '' },
		{ phone: '' }
	];
	private uniqueFields: string[] = this.uniqueConditions
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

	async getAllUsers(): Promise<User[]> {
		return this.userRepository.find({ relations: { photos: true } });
	}

	async getUserById(
		id: number,
		manager: EntityManager | null = null
	): Promise<User> {
		const repository = this.getRepository(manager);

		return repository.findOne({ where: { id } });
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

			throw new HttpException(err.details, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async updateUser(userDto: UpdateUserDto, id: number): Promise<User> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const user = await this.entitiesService.isExist<User>(
				[{ id }],
				repository
			);

			const dtoKeys = Object.keys(userDto);
			const doHaveUniqueField = dtoKeys.some((key) =>
				this.uniqueFields.includes(key)
			);

			if (doHaveUniqueField) {
				await this.findUserDublicate<UpdateUserDto>(
					user,
					userDto,
					repository
				);
			}

			await repository.update(id, userDto);
			// Get updated data about user and return it
			const updatedUser = await this.getUserById(id, queryRunner.manager);

			await queryRunner.commitTransaction();
			return updatedUser;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.detail, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteUser(id: number): Promise<User> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

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

			throw new HttpException(err.detail, HttpStatus.BAD_REQUEST);
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
				this.uniqueConditions
			);

		return await this.entitiesService.checkForDublicates<User>(
			repository,
			findOptions,
			'User'
		);
	}

	private getQueryRunnerAndRepository(): {
		queryRunner: QueryRunner;
		repository: Repository<User>;
	} {
		const queryRunner = this.dataSource.createQueryRunner();
		const repository = queryRunner.manager.getRepository(User);

		return { queryRunner, repository };
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
