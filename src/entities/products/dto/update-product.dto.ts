import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	MinLength
} from 'class-validator';
import {
	BooleanErrorMessages,
	NumberErrorMessages,
	StringErrorMessages
} from '../../../common/other/error-messages';

export class UpdateProductDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly product_name: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	@IsOptional()
	readonly description: string;

	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	@IsOptional()
	readonly price: number;

	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	@IsOptional()
	readonly quantity: number;

	@IsBoolean({ message: BooleanErrorMessages.mustBeBoolean })
	@IsOptional()
	readonly isActive: boolean;
}
