import { IsOptional, IsString, MinLength } from 'class-validator';
import { StringErrorMessages } from '../../../common/other/error-messages';

export class UpdateCommentDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly title: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	@IsOptional()
	readonly content: string;
}
