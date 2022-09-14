import { IsString, MinLength } from 'class-validator';
import { StringErrorMessages } from '../../../common/other/error-messages';

export class CreateCategoryDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly category_name: string;
}
