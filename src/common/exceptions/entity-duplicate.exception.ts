import { HttpException, HttpStatus } from '@nestjs/common';

export class EntityDuplicateException extends HttpException {
	message: string;

	constructor(message: string) {
		super(message, HttpStatus.BAD_REQUEST);
	}
}
