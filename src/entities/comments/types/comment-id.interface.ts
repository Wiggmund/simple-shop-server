import { Comment } from '../entity/comment.entity';

export type CommentId = Pick<Comment, 'id'>;

const temp: CommentId = {
	id: 1
};
type key = keyof CommentId;

export type CommentIdType = typeof temp[key];
