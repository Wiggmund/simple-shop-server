import { UserPayloadDto } from './user-payload.dto';

export class UserDataDto {
	refreshToken: string;
	accessToken: string;
	user: UserPayloadDto;
}
