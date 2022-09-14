import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import {
	NumberErrorMessages,
	StringErrorMessages
} from '../../../common/other/error-messages';
import { ProductIdType } from '../../products/types/product-id.interface';
import { UserIdType } from '../../users/types/user-id.interface';

export class CreateCommentDataDto {
	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	readonly userId: UserIdType;

	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	readonly productId: ProductIdType;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly title: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly content: string;
}
