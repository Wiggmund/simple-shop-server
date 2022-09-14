import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';
import {
	DateErrorMessages,
	StringErrorMessages
} from '../../../common/other/error-messages';

export class UpdateUserDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly firstName: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	@IsOptional()
	readonly lastName: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@IsDateString({}, { message: DateErrorMessages.mustBeISODate })
	@IsOptional()
	readonly birthday: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(12, {
		message: StringErrorMessages.shortString
	})
	@IsOptional()
	readonly phone: string;
}
