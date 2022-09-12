import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Comment } from './entity/comment.entity';
import { User } from '../users/entity/user.entity';
import { Product } from '../products/entity/product.entity';

import { CreateCommentDataDto } from './dto/create-comment-data.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

import { EntitiesService } from '../entities.service';

import { TransactionKit } from '../../common/types/transaction-kit.interface';
import { CommentId, CommentIdType } from './types/comment-id.interface';
import { CommentRelatedEntities } from './types/comment-related-entities.interface';
import { ProductIdType } from '../products/types/product-id.interface';
import { UserIdType } from '../users/types/user-id.interface';

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(Comment)
		private commentRepository: Repository<Comment>,
		private entitiesService: EntitiesService,
		private dataSource: DataSource
	) {}

	async getAllComments(
		manager: EntityManager | null = null
	): Promise<Comment[]> {
		const repository = this.getRepository(manager);
		return repository.createQueryBuilder('comment').getMany();
	}

	async getCommentById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Comment> {
		const repository = this.getRepository(manager);

		return repository
			.createQueryBuilder('vendor')
			.where('vendor.id = :id', { id })
			.getOne();
	}

	async createComment(
		commentDataDto: CreateCommentDataDto
	): Promise<Comment> {
		const { queryRunner, repository, manager } =
			this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const commentDto = new CreateCommentDto(commentDataDto);
			const { userId, productId } = commentDataDto;

			await this.entitiesService.isExist<User>(
				[{ id: userId }],
				manager.getRepository(User)
			);

			await this.entitiesService.isExist<Product>(
				[{ id: productId }],
				manager.getRepository(Product)
			);

			const commentId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(Comment)
						.values(commentDto)
						.execute()
				).identifiers as CommentId[]
			)[0].id;

			await repository
				.createQueryBuilder()
				.relation(Comment, 'user')
				.of(commentId)
				.set(userId);

			await repository
				.createQueryBuilder()
				.relation(Comment, 'product')
				.of(commentId)
				.set(productId);

			const createdComment = await repository
				.createQueryBuilder('comment')
				.leftJoinAndSelect('comment.user', 'user')
				.leftJoinAndSelect('comment.product', 'product')
				.where('comment.id = :commentId', { commentId })
				.getOne();

			await queryRunner.commitTransaction();
			return createdComment;
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

	async updateComment(
		commentDto: UpdateCommentDto,
		id: number
	): Promise<Comment> {
		const { queryRunner, repository, manager } =
			this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.entitiesService.isExist<Comment>([{ id }], repository);

			await repository
				.createQueryBuilder()
				.update(Comment)
				.set(commentDto)
				.where('id = :id', { id })
				.execute();

			const updatedComment = await this.getCommentById(id, manager);

			await queryRunner.commitTransaction();
			return updatedComment;
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

	async deleteComment(id: number): Promise<Comment> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const comment = await this.entitiesService.isExist<Comment>(
				[{ id }],
				repository
			);

			await repository
				.createQueryBuilder()
				.delete()
				.from(Comment)
				.where('id = :id', { id })
				.execute();

			await queryRunner.commitTransaction();
			return comment;
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

	async unbindEntities(
		relatedEntity: CommentRelatedEntities,
		id: ProductIdType | UserIdType,
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.getRepository(manager);

		let ids: CommentIdType[];
		switch (relatedEntity) {
			case 'product':
				ids = (
					await repository
						.createQueryBuilder('comment')
						.select('comment.id')
						.where('comment.productId = :id', { id })
						.getMany()
				).map((comment) => comment.id);

				await this.unbindProductsById(ids, repository);
				break;

			case 'user':
				ids = (
					await repository
						.createQueryBuilder('comment')
						.select('comment.id')
						.where('comment.userId = :id', { id })
						.getMany()
				).map((comment) => comment.id);

				await this.unbindUsersById(ids, repository);
				break;
		}
	}

	private async unbindProductsById(
		ids: CommentIdType[],
		repository: Repository<Comment>
	): Promise<void> {
		await repository
			.createQueryBuilder()
			.relation(Comment, 'product')
			.of(ids)
			.set(null);
	}

	private async unbindUsersById(
		ids: UserIdType[],
		repository: Repository<Comment>
	): Promise<void> {
		await repository
			.createQueryBuilder()
			.relation(Comment, 'user')
			.of(ids)
			.set(null);
	}

	private getQueryRunnerAndRepository(): TransactionKit<Comment> {
		const queryRunner = this.dataSource.createQueryRunner();
		const manager = queryRunner.manager;
		const repository = manager.getRepository(Comment);

		return { queryRunner, repository, manager };
	}

	private getRepository(
		manager: EntityManager | null = null
	): Repository<Comment> {
		const repository = manager
			? manager.getRepository(Comment)
			: this.commentRepository;

		return repository;
	}
}
