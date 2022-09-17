import { MailService } from './../../../mail/mail.service';
import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import * as bcrypt from 'bcrypt';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';

import { User } from '../entity/user.entity';
import { Photo } from '../../photos/entity/photo.entity';
import { Transaction } from '../../transactions/entity/transaction.entity';
import { Comment } from '../../comments/entity/comment.entity';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import { UserUniqueFields } from '../types/user-unique-fields.interface';
import { UserId, UserIdType } from '../types/user-id.interface';
import { IUserRelatedEntitiesIds } from '../types/user-related-entities-ids.interface';

import { EntitiesService } from '../../entities.service';
import { PhotosService } from '../../photos/photos.service';
import { FileSystemService } from '../../../file-system/file-system.service';
import { CommentsService } from '../../comments/comments.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { EntityNotFoundException } from '../../../common/exceptions/entity-not-found.exception';
import { DatabaseInternalException } from '../../../common/exceptions/database-internal.exception';
import { UserRolesService } from './user-roles.service';
import { RefreshTokenService } from '../../refreshTokens/refresh-token.service';
import * as uuid from 'uuid';

@Injectable()
export class UsersService {
	private readonly userUniqueFieldsToCheck: FindOptionsWhere<UserUniqueFields>[] =
		[{ firstName: '', lastName: '' }, { email: '' }, { phone: '' }];

	private uniqueFields: string[] = this.entitiesService.getUniqueFieldsList(
		this.userUniqueFieldsToCheck
	);

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private entitiesService: EntitiesService,
		private photosService: PhotosService,
		private fileSystemService: FileSystemService,
		private commentsService: CommentsService,
		private refreshTokenService: RefreshTokenService,
		private mailService: MailService,

		@Inject(forwardRef(() => TransactionsService))
		private transactionsService: TransactionsService,

		@Inject(forwardRef(() => UserRolesService))
		private userRolesService: UserRolesService
	) {}

	async getAllUsers(manager: EntityManager | null = null): Promise<User[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			User
		);

		return repository.createQueryBuilder('user').getMany();
	}

	async getUserById(
		id: number,
		manager: EntityManager | null = null
	): Promise<User> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			User
		);

		const candidate = await repository
			.createQueryBuilder('user')
			.where('user.id = :id', { id })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`User with given id=${id} not found`
			);
		}

		return candidate;
	}

	async getUserByActivationLink(
		activationLink: string,
		manager: EntityManager | null = null
	): Promise<User> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			User
		);

		const candidate = await repository
			.createQueryBuilder('user')
			.where('user.activationLink = :activationLink', { activationLink })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`User with given activationLink=${activationLink} not found`
			);
		}

		return candidate;
	}

	async getUserByEmail(
		email: string,
		manager: EntityManager | null = null
	): Promise<User> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			User
		);

		const candidate = await repository
			.createQueryBuilder('user')
			.where('user.email = :email', { email })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`User with given email=${email} not found`
			);
		}

		return candidate;
	}

	async createUser(
		userDto: CreateUserDto,
		file: Express.Multer.File
	): Promise<User> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<User>(User);
		const doPhotoProvided = Boolean(file);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.entitiesService.findEntityDuplicate<User>(
				null,
				userDto,
				repository,
				this.userUniqueFieldsToCheck
			);

			const hashedPassword = await bcrypt.hash(userDto.password, 5);
			const activationLink = uuid.v4();
			const userId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(User)
						.values({
							...userDto,
							password: hashedPassword,
							activationLink
						})
						.execute()
				).identifiers as UserId[]
			)[0].id;

			await this.userRolesService.addDefaultUserRole(userId, manager);

			if (doPhotoProvided) {
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
			await this.mailService.sendActivationMail(
				userDto.email,
				`${process.env.API_URL}/auth/activate/${activationLink}`
			);
			return savedUser;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (doPhotoProvided) {
				console.log('file', file);
				console.log('file.filename', file.filename);
				this.fileSystemService.deletePhotoFile(file.filename);
			}

			if (err instanceof HttpException) {
				throw err;
			}

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async updateUser(userDto: UpdateUserDto, id: number): Promise<User> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<User>(User);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const user = await this.getUserById(id, manager);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateUserDto>(
					userDto,
					this.uniqueFields
				)
			) {
				await this.entitiesService.findEntityDuplicate<User>(
					user,
					userDto,
					repository,
					this.userUniqueFieldsToCheck
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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async activateAccount(id: UserIdType): Promise<void> {
		await this.userRepository
			.createQueryBuilder()
			.update(User)
			.set({ isActivated: true })
			.where('id = :id', { id })
			.execute();
	}

	async deleteUser(id: number): Promise<User> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<User>(User);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const user = await this.getUserById(id, manager);

			const { photosIds, commentsIds, transactionIds } =
				await this.getRelatedEntitiesIds(id, repository);

			await this.photosService.deleteManyPhotosByIds(photosIds, manager);

			await this.commentsService.unbindEntities(
				'user',
				commentsIds,
				manager
			);
			await this.transactionsService.unbindEntities(
				'user',
				transactionIds,
				manager
			);

			await this.refreshTokenService.deleteTokenByUserId(id, manager);

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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	private async getRelatedEntitiesIds(
		userId: UserIdType,
		repository: Repository<User>
	): Promise<IUserRelatedEntitiesIds> {
		const photosIds = (
			await repository
				.createQueryBuilder()
				.relation(User, 'photos')
				.of(userId)
				.loadMany<Photo>()
		).map((photo) => photo.id);

		const commentsIds = (
			await repository
				.createQueryBuilder()
				.relation(User, 'comments')
				.of(userId)
				.loadMany<Comment>()
		).map((comment) => comment.id);

		const transactionIds = (
			await repository
				.createQueryBuilder()
				.relation(User, 'transactions')
				.of(userId)
				.loadMany<Transaction>()
		).map((transaction) => transaction.id);

		return { photosIds, commentsIds, transactionIds };
	}
}
