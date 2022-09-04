import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
	constructor(private commentsService: CommentsService) {}

	@Get()
	getAllComments() {
		return this.commentsService.getAllComments();
	}

	@Get(':id')
	getCommentById(@Param('id') id: number) {
		return this.commentsService.getCommentById(id);
	}

	@Post()
	createComment(@Body() commentDto: CreateCommentDto) {
		return this.commentsService.createComment(commentDto);
	}

	@Put(':id')
	updateComment(
		@Body() commentDto: UpdateCommentDto,
		@Param('id') id: number
	) {
		return this.commentsService.updateComment(commentDto, id);
	}

	@Delete(':id')
	deleteComment(@Param('id') id: number) {
		return this.commentsService.deleteComment(id);
	}
}
