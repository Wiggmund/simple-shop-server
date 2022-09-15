import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Comment } from './entity/comment.entity';
import { User } from '../users/entity/user.entity';
import { Product } from '../products/entity/product.entity';

import { CreateCommentDataDto } from './dto/create-comment-data.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

import { EntitiesService } from '../entities.service';

import { CommentId, CommentIdType } from './types/comment-id.interface';
import { CommentRelatedEntities } from './types/comment-related-entities.interface';
import { UserIdType } from '../users/types/user-id.interface';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { DatabaseInternalException } from '../../common/exceptions/database-internal.exception';

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(Comment)
		private commentRepository: Repository<Comment>,
		private entitiesService: EntitiesService
	) {}

	async getAllComments(
		manager: EntityManager | null = null
	): Promise<Comment[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.commentRepository,
			Comment
		);

		return repository.createQueryBuilder('comment').getMany();
	}

	async getCommentById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Comment> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.commentRepository,
			Comment
		);

		const candidate = await repository
			.createQueryBuilder('vendor')
			.where('vendor.id = :id', { id })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`Comment with given id=${id} not found`
			);
		}

		return candidate;
	}

	async createComment(
		commentDataDto: CreateCommentDataDto
	): Promise<Comment> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Comment>(Comment);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const commentDto = new CreateCommentDto(commentDataDto);
			const { userId, productId } = commentDataDto;

			const isUser = await this.entitiesService.isExist<User>(
				manager,
				{ id: userId },
				User
			);
			const isProduct = await this.entitiesService.isExist<Product>(
				manager,
				{ id: productId },
				Product
			);

			if (!isUser || !isProduct) {
				const { entityName, id } = isUser
					? { entityName: 'Product', id: productId }
					: { entityName: 'User', id: userId };

				throw new EntityNotFoundException(
					`${entityName} with given id=${id} not found`
				);
			}

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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async updateComment(
		commentDto: UpdateCommentDto,
		id: number
	): Promise<Comment> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Comment>(Comment);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const isComment = await this.entitiesService.isExist<Comment>(
				manager,
				{ id },
				Comment
			);
			if (isComment) {
				throw new EntityNotFoundException(
					`Comment with given id=${id} not found`
				);
			}

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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteComment(id: number): Promise<Comment> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Comment>(Comment);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const comment = await this.getCommentById(id, manager);

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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async unbindEntities(
		relatedEntity: CommentRelatedEntities,
		ids: CommentIdType[],
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.commentRepository,
			Comment
		);

		switch (relatedEntity) {
			case 'product':
				await this.unbindProducts(ids, repository);
				break;

			case 'user':
				await this.unbindUsers(ids, repository);
				break;
		}
	}

	private async unbindProducts(
		ids: CommentIdType[],
		repository: Repository<Comment>
	): Promise<void> {
		await repository
			.createQueryBuilder()
			.relation(Comment, 'product')
			.of(ids)
			.set(null);
	}

	private async unbindUsers(
		ids: UserIdType[],
		repository: Repository<Comment>
	): Promise<void> {
		await repository
			.createQueryBuilder()
			.relation(Comment, 'user')
			.of(ids)
			.set(null);
	}
}
