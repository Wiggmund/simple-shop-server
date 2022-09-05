import { Express } from 'express';

export class CreatePhotoDto {
	readonly url: string;
	readonly filename: string;
	readonly destination: string;
	readonly type: string;
	readonly size: number;

	constructor(file: Express.Multer.File) {
		const host = process.env.NGINX_STATIC_HOST;
		const port = process.env.NGINX_PORT;

		this.type = file.mimetype.split('/')[1];
		this.filename = file.filename.slice(0, file.filename.lastIndexOf('.'));
		this.destination = file.destination;
		this.size = file.size;
		this.url = `http://${host}:${port}/${this.filename}.${this.type}`;
	}
}
