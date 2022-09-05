import { Express } from 'express';

export class CreatePhotoDto {
	readonly url: string;
	readonly type: string;
	readonly size: number;

	constructor(file: Express.Multer.File) {
		const host = process.env.NGINX_STATIC_HOST;
		const port = process.env.NGINX_PORT;
		const photoNameWithExtension = file.filename;

		this.url = `http://${host}:${port}/${photoNameWithExtension}`;
		this.type = file.mimetype.split('/')[1];
		this.size = file.size;
	}
}
