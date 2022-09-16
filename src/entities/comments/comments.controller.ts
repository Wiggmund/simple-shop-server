import { JwtRolesGuard } from './../../common/guards/jwt-role.guard';
import { RolesEnum } from './../../common/enums/roles.enum';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards
} from '@nestjs/common';
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';
import { CommentsService } from './comments.service';
import { CreateCommentDataDto } from './dto/create-comment-data.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Roles } from '../../common/decorators/role.decorator';

@Roles(RolesEnum.Admin)
@UseGuards(JwtRolesGuard)
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
	createComment(@Body(DtoValidationPipe) commentDto: CreateCommentDataDto) {
		return this.commentsService.createComment(commentDto);
	}

	@Put(':id')
	updateComment(
		@Body(DtoValidationPipe) commentDto: UpdateCommentDto,
		@Param('id') id: number
	) {
		return this.commentsService.updateComment(commentDto, id);
	}

	@Delete(':id')
	deleteComment(@Param('id') id: number) {
		return this.commentsService.deleteComment(id);
	}
}
