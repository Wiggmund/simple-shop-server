import { CommentIdType } from '../../../entities/comments/types/comment-id.interface';
import { PhotoIdType } from '../../../entities/photos/types/photo-id.interface';
import { TransactionIdType } from '../../../entities/transactions/types/transaction-id.interface';

export interface IUserRelatedEntitiesIds {
	photosIds: PhotoIdType[];
	commentsIds: CommentIdType[];
	transactionIds: TransactionIdType[];
}
