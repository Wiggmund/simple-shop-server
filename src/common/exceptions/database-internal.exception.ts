import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseInternalException extends HttpException {
	message: string;

	constructor(err: any) {
		super(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
