import { HttpException, HttpStatus } from '@nestjs/common';

export class EntityNotFoundException extends HttpException {
	message: string;

	constructor(message: string) {
		super(message, HttpStatus.NOT_FOUND);
	}
}
