import { IsString, MinLength } from 'class-validator';
import { StringErrorMessages } from '../../../common/other/error-messages';

export class CreateAttributeDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly attribute_name: string;
}
