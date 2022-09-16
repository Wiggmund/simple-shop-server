import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { EntityManager } from 'typeorm';
import { UserDataDto } from '../users/dto/user-data.dto';
import { UserPayloadDto } from '../users/dto/user-payload.dto';
import { UserRolesService } from '../users/services/user-roles.service';
import { UsersService } from '../users/services/users.service';
import { RefreshTokenService } from './refresh-token.service';
import { ITokensPair } from './types/tokens-pair.interface';

@Injectable()
export class TokensService {
	constructor(
		private configService: ConfigService,
		private refreshTokenService: RefreshTokenService,
		private jwtService: JwtService,
		private userRolesService: UserRolesService,
		private usersService: UsersService
	) {}

	async validateAccessToken(token: string): Promise<UserPayloadDto | null> {
		try {
			const payloadData = this.jwtService.verify(token, {
				secret: this.configService.get<string>(
					'JWT_ACCESS_TOKEN_SECRET'
				)
			});

			return payloadData;
		} catch (e) {
			return null;
		}
	}

	async validateRefreshToken(token: string): Promise<UserPayloadDto | null> {
		try {
			const payloadData = this.jwtService.verify(token, {
				secret: this.configService.get<string>(
					'JWT_REFRESH_TOKEN_SECRET'
				)
			});

			return payloadData;
		} catch (e) {
			return null;
		}
	}

	async generateAndSaveTokens(
		userPayload: UserPayloadDto,
		manager: EntityManager | null = null
	): Promise<ITokensPair> {
		const { refreshToken, accessToken } = this.generateToken(userPayload);

		await this.refreshTokenService.saveToken(
			{ userId: userPayload.id, token: refreshToken },
			manager
		);

		return { refreshToken, accessToken };
	}

	async updateRefreshToken(token: string): Promise<UserDataDto> {
		if (!token) {
			throw new UnauthorizedException('You are not authorized');
		}

		const tokenFromDB = await this.refreshTokenService.getToken(token);
		const userData = await this.validateRefreshToken(token);
		if (!tokenFromDB || !userData) {
			throw new UnauthorizedException('You are not authorized');
		}

		// Get fresh data about user
		const user = await this.usersService.getUserById(userData.id);
		const userRoles = await this.userRolesService.getUserRolesList(user.id);

		// Clear iat/exp props from userData after verification.
		// JWT verify attach this props to unpacked data
		const userDto = new UserPayloadDto(user, userRoles);
		const refreshedTokens = await this.generateAndSaveTokens({
			...userDto
		});

		return {
			...refreshedTokens,
			user: userDto
		};
	}

	private generateToken(payload: UserPayloadDto): ITokensPair {
		const accessExpiresIn = this.configService.get<string>(
			'JWT_ACCESS_TOKEN_EXPIRES_MINUTES'
		);
		const refreshExpiresIn = this.configService.get<string>(
			'JWT_REFRESH_TOKEN_EXPIRES_DAYS'
		);

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
			expiresIn: `${accessExpiresIn}m`
		});

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
			expiresIn: `${refreshExpiresIn}d`
		});

		return { accessToken, refreshToken };
	}

	saveTokenToCookie(token: string, response: Response): void {
		const expiresIn = Number(
			this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_DAYS')
		);
		response.cookie('refreshToken', token, {
			httpOnly: true,
			maxAge: expiresIn * 24 * 60 * 60 * 1000
		});
	}
}
