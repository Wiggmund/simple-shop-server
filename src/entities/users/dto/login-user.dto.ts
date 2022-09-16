import { IsEmail, IsString, MinLength } from 'class-validator';
import { StringErrorMessages } from '../../../common/other/error-messages';

export class LoginUserDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@IsEmail({}, { message: StringErrorMessages.mustBeEmail })
	readonly email: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(6, { message: StringErrorMessages.shortString })
	readonly password: string;
}
