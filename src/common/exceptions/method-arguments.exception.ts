import { HttpException, HttpStatus } from '@nestjs/common';

export class MethodArgumentsException extends HttpException {
	message: string;

	constructor(message: string) {
		super(message, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
