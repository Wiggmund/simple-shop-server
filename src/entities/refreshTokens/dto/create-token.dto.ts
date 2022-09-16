import { IsJWT, IsNumber, IsPositive, IsString } from 'class-validator';
import {
	NumberErrorMessages,
	StringErrorMessages
} from '../../../common/other/error-messages';
import { UserIdType } from '../../users/types/user-id.interface';

export class CreateTokenDto {
	@IsNumber({}, { message: NumberErrorMessages.mustBeNumber })
	@IsPositive({ message: NumberErrorMessages.positive })
	userId: UserIdType;

	@IsString({ message: StringErrorMessages.mustBeString })
	@IsJWT({ message: StringErrorMessages.mustBeJwt })
	token: string;
}
