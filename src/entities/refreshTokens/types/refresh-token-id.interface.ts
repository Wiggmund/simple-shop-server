import { RefreshToken } from '../entity/refresh-token.entity';

export type RefreshTokenId = Pick<RefreshToken, 'id'>;

const temp: RefreshTokenId = {
	id: 1
};
type key = keyof RefreshTokenId;

export type RefreshTokenIdType = typeof temp[key];
