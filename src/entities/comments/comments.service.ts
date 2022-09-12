import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Comment } from './entity/comment.entity';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

import { EntitiesService } from '../entities.service';

import { TransactionKit } from '../../common/types/transaction-kit.interface';
import { CommentId } from './types/comment-id.interface';

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

	async createComment(commentDto: CreateCommentDto): Promise<Comment> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
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

			const createdComment = await repository
				.createQueryBuilder('comment')
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
