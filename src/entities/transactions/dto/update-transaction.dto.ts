import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { NumberErrorMessages } from '../../../common/other/error-messages';
import { ProductIdType } from '../../products/types/product-id.interface';
import { UserIdType } from '../../users/types/user-id.interface';

export class UpdateTransactionDto {
	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	@IsOptional()
	readonly userId: UserIdType;

	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	@IsOptional()
	readonly productId: ProductIdType;

	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	readonly amount: number;

	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	readonly full_price: number;
}
