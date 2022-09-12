import { ProductIdType } from '../../products/types/product-id.interface';
import { UserIdType } from '../../users/types/user-id.interface';

export class CreateCommentDataDto {
	readonly userId: UserIdType;
	readonly productId: ProductIdType;
	readonly title: string;
	readonly content: string;
}
