import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { DtoValidationException } from '../exceptions/dto-validation.exception';

@Injectable()
export class DtoValidationPipe implements PipeTransform<any> {
	async transform(value: any, metadata: ArgumentMetadata) {
		const targetObject = plainToInstance(metadata.metatype, value);
		const errors = await validate(targetObject);

		if (errors.length > 0) {
			throw new DtoValidationException(
				this.generateErrorMessages(errors)
			);
		}

		return value;
	}

	private generateErrorMessages(errors: ValidationError[]): string[] {
		const message = errors.map((err) => {
			return `${err.property} - ${Object.values(err.constraints).join(
				' | '
			)}`.trim();
		});

		return message;
	}
}
