import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../roles/entity/role.entity';
import { RolesService } from '../../roles/roles.service';
import { EntityManager, Repository } from 'typeorm';
import { AddDeleteUserRoleDto } from '../dto/add-delete-user-role.dto';
import { User } from '../entity/user.entity';
import { UserIdType } from '../types/user-id.interface';
import { UsersService } from './users.service';
import { EntitiesService } from '../../../entities/entities.service';
import { AvailableEntitiesEnum } from '../../../common/enums/available-entities.enum';

@Injectable()
export class UserRolesService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private rolesService: RolesService,
		private entitiesService: EntitiesService,
		private usersService: UsersService
	) {}

	async getUserRoles(
		userId: UserIdType,
		manager: EntityManager | null = null
	): Promise<Role[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			AvailableEntitiesEnum.User
		);

		return repository
			.createQueryBuilder()
			.relation(User, 'roles')
			.of(userId)
			.loadMany();
	}

	async addUserRole(
		userId: UserIdType,
		dto: AddDeleteUserRoleDto,
		manager: EntityManager | null = null
	): Promise<string> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			AvailableEntitiesEnum.User
		);

		const { id: roleId, value } =
			await this.checkUserExistenseAndGetRoleOrFail(
				userId,
				dto.value,
				manager
			);

		if (await this.doUserHaveRole(userId, value, manager)) {
			throw new HttpException(
				`User already has role [${value}]`,
				HttpStatus.BAD_REQUEST
			);
		}

		await repository
			.createQueryBuilder()
			.relation(User, 'roles')
			.of(userId)
			.add(roleId);

		return `Role [${value}] has been added for user with id=${userId}`;
	}

	async deleteUserRole(
		userId: UserIdType,
		dto: AddDeleteUserRoleDto,
		manager: EntityManager | null = null
	): Promise<string> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			AvailableEntitiesEnum.User
		);

		const { id: roleId, value } =
			await this.checkUserExistenseAndGetRoleOrFail(
				userId,
				dto.value,
				manager
			);

		const doHaveRole = await this.doUserHaveRole(userId, value, manager);
		if (!doHaveRole) {
			throw new HttpException(
				`User didn't have role [${value}]`,
				HttpStatus.BAD_REQUEST
			);
		}

		await repository
			.createQueryBuilder()
			.relation(User, 'roles')
			.of(userId)
			.remove(roleId);

		return `Role [${value}] has been deleted for user with id=${userId}`;
	}

	private async checkUserExistenseAndGetRoleOrFail(
		userId: UserIdType,
		value: string,
		manager: EntityManager | null = null
	): Promise<Role> {
		const role = await this.rolesService.getRoleByValueOrFail(
			value,
			manager
		);
		await this.usersService.getUserByIdOrFail(userId, manager);

		return role;
	}

	private async doUserHaveRole(
		userId: UserIdType,
		value: string,
		manager: EntityManager | null = null
	): Promise<boolean> {
		const userRoles = (await this.getUserRoles(userId, manager)).map(
			(role) => role.value
		);
		console.log('userRoles', userRoles);
		return userRoles.includes(value);
	}
}
