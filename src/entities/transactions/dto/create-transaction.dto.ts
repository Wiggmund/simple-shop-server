import { ProductIdType } from 'src/entities/products/types/product-id.interface';
import { UserIdType } from 'src/entities/users/types/user-id.interface';

export class CreateTransactionDto {
	readonly userId: UserIdType;
	readonly productId: ProductIdType;

	readonly amount: number;
	readonly full_price: number;
}
