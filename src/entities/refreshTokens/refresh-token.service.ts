import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { UserIdType } from '../users/types/user-id.interface';
import { RefreshToken } from './entity/refresh-token.entity';
import {
	RefreshTokenId,
	RefreshTokenIdType
} from './types/refresh-token-id.interface';
import { IRefreshTokenSaveData } from './types/refresh-token-save-data.interface';

@Injectable()
export class RefreshTokenService {
	constructor(
		@InjectRepository(RefreshToken)
		private refreshTokenRepository: Repository<RefreshToken>,

		private entitiesService: EntitiesService
	) {}

	async saveToken(
		{ userId, token }: IRefreshTokenSaveData,
		manager: EntityManager | null = null
	): Promise<RefreshToken> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.refreshTokenRepository,
			RefreshToken
		);
		const tokenFromDb = await this.getTokenByUserId(userId, manager);

		let refreshTokenId: RefreshTokenIdType;
		if (tokenFromDb) {
			await repository
				.createQueryBuilder()
				.update(RefreshToken)
				.set({ token })
				.where('id = :id', { id: tokenFromDb.id })
				.execute();
		} else {
			refreshTokenId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(RefreshToken)
						.values({ token, userId })
						.execute()
				).identifiers as RefreshTokenId[]
			)[0].id;
		}

		return await repository
			.createQueryBuilder('refreshToken')
			.where('refreshToken.id = :refreshTokenId', { refreshTokenId })
			.getOne();
	}

	async deleteToken(
		token: string,
		manager: EntityManager | null = null
	): Promise<string> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.refreshTokenRepository,
			RefreshToken
		);

		await this.entitiesService.isExist<RefreshToken>(
			repository.manager,
			{ token },
			RefreshToken
		);

		await repository
			.createQueryBuilder()
			.delete()
			.from(RefreshToken)
			.where('token = :token', { token })
			.execute();

		return token;
	}

	async deleteTokenByUserId(
		userId: UserIdType,
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.refreshTokenRepository,
			RefreshToken
		);

		await this.entitiesService.isExist<RefreshToken>(
			manager,
			{ userId },
			RefreshToken
		);

		await repository
			.createQueryBuilder()
			.delete()
			.from(RefreshToken)
			.where('userId = :userId', { userId })
			.execute();
	}

	async getToken(
		token: string,
		manager: EntityManager | null = null
	): Promise<RefreshToken | null> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.refreshTokenRepository,
			RefreshToken
		);

		return repository
			.createQueryBuilder('refreshToken')
			.where('refreshToken.token = :token', { token })
			.getOne();
	}

	private async getTokenByUserId(
		userId: UserIdType,
		manager: EntityManager | null = null
	): Promise<RefreshToken | null> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.refreshTokenRepository,
			RefreshToken
		);

		return repository
			.createQueryBuilder('refreshToken')
			.where('refreshToken.userId = :userId', { userId })
			.getOne();
	}
}
