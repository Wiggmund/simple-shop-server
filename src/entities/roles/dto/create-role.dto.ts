import { IsString, MinLength } from 'class-validator';
import { StringErrorMessages } from '../../../common/other/error-messages';

export class CreateRoleDto {
	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly value: string;

	@IsString({ message: StringErrorMessages.mustBeString })
	@MinLength(StringErrorMessages.defaultMinLength, {
		message: StringErrorMessages.shortString
	})
	readonly description: string;

	constructor(value: string, description: string) {
		this.value = value;
		this.description = description;
	}
}
