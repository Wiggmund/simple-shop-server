import { IsDateString, IsEmail, IsString, MinLength } from 'class-validator';
import {
	DateErrorMessages,
	StringErrorMessages
} from '../../../common/other/error-messages';

export class CreateUserDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly firstName: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly lastName: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@IsDateString({}, { message: DateErrorMessages.mustBeISODate })
	readonly birthday: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@IsEmail({}, { message: StringErrorMessages.mustBeEmail })
	readonly email: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(6, { message: StringErrorMessages.shortString })
	readonly password: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(12, {
		message: StringErrorMessages.shortString
	})
	readonly phone: string;
}
