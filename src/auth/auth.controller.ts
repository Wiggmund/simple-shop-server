import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Res,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Cookies } from '../common/decorators/cookies.decorator';
import { DtoValidationPipe } from '../common/pipes/dto-validation.pipe';
import { RefreshTokenService } from '../entities/refreshTokens/refresh-token.service';
import { TokensService } from '../entities/refreshTokens/tokens.service';
import { CreateUserDto } from '../entities/users/dto/create-user.dto';
import { LoginUserDto } from '../entities/users/dto/login-user.dto';
import { AuthService } from './auth.service';
import { Express } from 'express';

@Controller('auth')
export class AuthController {
	constructor(
		private tokensService: TokensService,
		private refreshTokenService: RefreshTokenService,
		private authService: AuthService
	) {}

	@Get('activate/:link')
	async activate(
		@Param('link') link: string,
		@Res({ passthrough: true }) response: Response
	) {
		await this.authService.activate(link);
		response.redirect(process.env.CLIENT_URL);
	}

	@Post('/register')
	@UseInterceptors(FileInterceptor('avatar'))
	async register(
		@Body(DtoValidationPipe) userDto: CreateUserDto,
		@UploadedFile() file: Express.Multer.File,
		@Res({ passthrough: true }) response: Response
	) {
		const userData = await this.authService.register(userDto, file);
		this.tokensService.saveTokenToCookie(userData.refreshToken, response);
		return userData;
	}

	@Post('/login')
	async login(
		@Body(DtoValidationPipe) userDto: LoginUserDto,
		@Res({ passthrough: true }) response: Response
	) {
		const userData = await this.authService.login(userDto);
		this.tokensService.saveTokenToCookie(userData.refreshToken, response);
		return userData;
	}

	@Post('/logout')
	async logout(
		@Res({ passthrough: true }) response: Response,
		@Cookies('refreshToken') refreshToken: string
	) {
		if (refreshToken) {
			await this.refreshTokenService.deleteToken(refreshToken);
		}
		response.clearCookie('refreshToken');
	}

	@Get('/refresh')
	async refresh(
		@Res({ passthrough: true }) response: Response,
		@Cookies('refreshToken') refreshToken: string
	) {
		const newTokens = await this.tokensService.updateRefreshToken(
			refreshToken
		);
		this.tokensService.saveTokenToCookie(newTokens.refreshToken, response);
		return newTokens;
	}
}
