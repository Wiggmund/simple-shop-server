import { UserIdType } from '../../users/types/user-id.interface';

export interface IRefreshTokenSaveData {
	userId: UserIdType;
	token: string;
}
