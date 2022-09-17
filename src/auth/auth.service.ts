import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Express } from 'express';
import { TokensService } from '../entities/refreshTokens/tokens.service';
import { CreateUserDto } from '../entities/users/dto/create-user.dto';
import { UsersService } from '../entities/users/services/users.service';
import { UserDataDto } from '../entities/users/dto/user-data.dto';
import { UserPayloadDto } from '../entities/users/dto/user-payload.dto';
import { User } from '../entities/users/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../entities/users/dto/login-user.dto';
import { UserRolesService } from '../entities/users/services/user-roles.service';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private userRolesService: UserRolesService,
		private tokensService: TokensService
	) {}

	async activate(link: string) {
		const user = await this.usersService.getUserByActivationLink(link);
		await this.usersService.activateAccount(user.id);
	}

	async register(
		userDto: CreateUserDto,
		file: Express.Multer.File
	): Promise<UserDataDto> {
		const user = await this.usersService.createUser(userDto, file);
		return this.getUserData(user);
	}

	async login(userDto: LoginUserDto): Promise<UserDataDto> {
		const user = await this.usersService.getUserByEmail(userDto.email);

		const isEqualPasswords = await bcrypt.compare(
			userDto.password,
			user.password
		);

		if (!isEqualPasswords) {
			throw new UnauthorizedException();
		}

		return this.getUserData(user);
	}

	private async getUserData(user: User): Promise<UserDataDto> {
		const userPayload = new UserPayloadDto(
			user,
			await this.userRolesService.getUserRolesList(user.id)
		);

		const tokens = await this.tokensService.generateAndSaveTokens({
			...userPayload
		});

		return {
			...tokens,
			user: userPayload
		};
	}
}
