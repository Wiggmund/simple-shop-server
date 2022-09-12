import { Photo } from '../entity/photo.entity';

export type PhotoId = Pick<Photo, 'id'>;

const temp: PhotoId = {
	id: 1
};
type key = keyof PhotoId;

export type PhotoIdType = typeof temp[key];
