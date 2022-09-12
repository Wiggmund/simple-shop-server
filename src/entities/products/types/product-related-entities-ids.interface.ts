import { CommentIdType } from '../../comments/types/comment-id.interface';
import { PhotoIdType } from '../../photos/types/photo-id.interface';
import { TransactionIdType } from '../../transactions/types/transaction-id.interface';

export interface IProductRelatedEntitiesIds {
	photosIds: PhotoIdType[];
	commentsIds: CommentIdType[];
	transactionIds: TransactionIdType[];
}
