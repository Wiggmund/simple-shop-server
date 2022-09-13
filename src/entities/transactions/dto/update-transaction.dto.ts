import { ProductIdType } from '../../products/types/product-id.interface';
import { UserIdType } from '../../users/types/user-id.interface';

export class UpdateTransactionDto {
	readonly userId: UserIdType;
	readonly productId: ProductIdType;

	readonly amount: number;
	readonly full_price: number;
}
