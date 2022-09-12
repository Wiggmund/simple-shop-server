import { CreateCommentDataDto } from './create-comment-data.dto';

export class CreateCommentDto {
	readonly title: string;
	readonly content: string;

	constructor(dto: CreateCommentDataDto) {
		this.title = dto.title;
		this.content = dto.content;
	}
}
