import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/role.decorator';
import { TokensService } from '../../entities/refreshTokens/tokens.service';

@Injectable()
export class JwtRolesGuard implements CanActivate {
	constructor(
		private tokenService: TokensService,
		private reflector: Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndMerge<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);

		const request = context.switchToHttp().getRequest<Request>();
		const authorization = request.headers.authorization;
		if (!authorization) {
			throw new UnauthorizedException('You are not authorized');
		}

		const [bearer, token] = authorization.split(' ');
		const userData = await this.tokenService.validateAccessToken(token);

		if (bearer !== 'Bearer' || !token || !userData) {
			throw new UnauthorizedException(
				'Your token is invalid, please log in'
			);
		}

		const doHaveRoles = userData.roles.some((role: string) =>
			requiredRoles.includes(role)
		);

		if (!doHaveRoles) {
			throw new UnauthorizedException(
				"You don't have enough permissions"
			);
		}

		return true;
	}
}
