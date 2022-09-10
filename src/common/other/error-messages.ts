import { ValidationArguments } from 'class-validator';

export const StringErrorMessages = {
	mustBeString: (data: ValidationArguments) => {
		return `Must be a string type, you provide [ ${checkForType(
			data.value
		)} ] type`;
	},
	shortString: (data: ValidationArguments) => {
		if (data.value === undefined) {
			return `You didn't provide value for $property`;
		}
		return `Is too short, minimum length is ${
			data.constraints[0]
		} characters you provide ${data.value.length || 0}`;
	},
	longString: (data: ValidationArguments) => {
		if (data.value === undefined) {
			return `You didn't provide value for $property`;
		}
		return `Is too long, maximum length is ${
			data.constraints[0]
		} characters you provide ${data.value.length || 0}`;
	},
	mustBeJwt: (data: ValidationArguments) => {
		if (data.value === undefined) {
			return `You didn't provide value for $property`;
		}
		return `Is not valid value. You provide ${data.value.length || 0}`;
	},
	mustBeEmail: 'Must be an email. You provide [ $value ]',
	defaultMinLength: 3
};

export const NumberErrorMessages = {
	mustBeNumber: (data: ValidationArguments) => {
		return `Must be a number type, you provide [ ${checkForType(
			data.value
		)} ] type`;
	},
	lowNumber: (data: ValidationArguments) => {
		if (data.value === undefined) {
			return `You didn't provide any value`;
		}
		return `Is too small. Your number must be higher than ${data.constraints[0]}, you provide ${data.value}`;
	},
	highNumber: (data: ValidationArguments) => {
		if (data.value === undefined) {
			return `You didn't provide any value`;
		}
		return `Is too big. Your number must be lower than ${data.constraints[0]}, you provide ${data.value}`;
	},
	positive: (data: ValidationArguments) => {
		if (data.value === undefined) {
			return `You didn't provide any value`;
		}
		return `Must be higher 0, you provide [ ${data.value} ]`;
	}
};

export const DateErrorMessages = {
	mustBeISODate: (data: ValidationArguments) => {
		if (data.value === undefined) {
			return `You didn't provide any value`;
		}
		return `Must be valid ISO8601 date value, you provide [ ${data.value} ]`;
	}
};

function checkForType(data) {
	if (data === null) {
		return 'null';
	}

	return typeof data;
}
