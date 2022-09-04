import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(Comment)
		private commentRepository: Repository<Comment>,
		private entitiesService: EntitiesService
	) {}

	async getAllComments(): Promise<Comment[]> {
		return this.commentRepository.find();
	}

	async getCommentById(id: number): Promise<Comment> {
		return this.commentRepository.findOne({ where: { id } });
	}

	async createComment(commentDto: CreateCommentDto): Promise<Comment> {
		const newComment = this.commentRepository.create(commentDto);
		return this.commentRepository.save(newComment);
	}

	async updateComment(
		commentDto: UpdateCommentDto,
		id: number
	): Promise<Comment> {
		await this.entitiesService.isExist<Comment>(
			[{ id }],
			this.commentRepository
		);

		await this.commentRepository.update(id, commentDto);
		// Get updated data about comment and return it
		return await this.getCommentById(id);
	}

	async deleteComment(id: number): Promise<Comment> {
		const comment = await this.entitiesService.isExist<Comment>(
			[{ id }],
			this.commentRepository
		);
		await this.commentRepository.delete(id);
		return comment;
	}
}
