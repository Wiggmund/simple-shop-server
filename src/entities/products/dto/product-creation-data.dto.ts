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
import { IAttributesData } from '../../attributes/types/attributes-data.interface';

export class ProductCreationDataDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly product_name: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly description: string;

	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	readonly price: number;

	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	readonly quantity: number;

	@IsBoolean({ message: BooleanErrorMessages.mustBeBoolean })
	@IsOptional()
	readonly isActive: boolean;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(1, {
		message: StringErrorMessages.shortString
	})
	readonly category: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(1, {
		message: StringErrorMessages.shortString
	})
	readonly vendor: string;

	// TODO: Use class-validator
	readonly attributes: IAttributesData;
}
