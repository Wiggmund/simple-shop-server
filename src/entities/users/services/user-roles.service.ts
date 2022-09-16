import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../roles/entity/role.entity';
import { RolesService } from '../../roles/roles.service';
import { EntityManager, Repository } from 'typeorm';
import { AddDeleteUserRoleDto } from '../dto/add-delete-user-role.dto';
import { User } from '../entity/user.entity';
import { UserIdType } from '../types/user-id.interface';
import { UsersService } from './users.service';
import { EntitiesService } from '../../entities.service';
import { EntityFieldsException } from '../../../common/exceptions/entity-fields.exception';
import { CreateRoleDto } from '../../roles/dto/create-role.dto';
import { EntityNotFoundException } from '../../../common/exceptions/entity-not-found.exception';

@Injectable()
export class UserRolesService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private rolesService: RolesService,
		private entitiesService: EntitiesService,

		@Inject(forwardRef(() => UsersService))
		private usersService: UsersService
	) {}

	async getUserRoles(
		userId: UserIdType,
		manager: EntityManager | null = null
	): Promise<Role[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			User
		);

		return repository
			.createQueryBuilder()
			.relation(User, 'roles')
			.of(userId)
			.loadMany();
	}

	async getUserRolesList(
		userId: UserIdType,
		manager: EntityManager | null = null
	): Promise<string[]> {
		const roles = await this.getUserRoles(userId, manager);
		return roles.map((role) => role.value);
	}

	async addUserRole(
		userId: UserIdType,
		dto: AddDeleteUserRoleDto,
		manager: EntityManager | null = null
	): Promise<string> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			User
		);

		const { id: roleId, value } =
			await this.checkUserExistenceAndGetRoleOrFail(
				userId,
				dto.value,
				manager
			);

		if (await this.doUserHaveRole(userId, value, manager)) {
			throw new EntityFieldsException(`User already has role [${value}]`);
		}

		await repository
			.createQueryBuilder()
			.relation(User, 'roles')
			.of(userId)
			.add(roleId);

		return `Role [${value}] has been added for user with id=${userId}`;
	}

	async addDefaultUserRole(
		userId: UserIdType,
		manager: EntityManager | null = null
	): Promise<void> {
		try {
			await this.addUserRole(userId, { value: 'user' }, manager);
		} catch (err) {
			// TRANSACTION PROBLEM
			if (err instanceof EntityNotFoundException) {
				await this.rolesService.createRole(
					new CreateRoleDto('user', 'User')
				);
				await this.addUserRole(userId, { value: 'user' }, manager);
				return;
			}

			throw err;
		}
	}

	async deleteUserRole(
		userId: UserIdType,
		dto: AddDeleteUserRoleDto,
		manager: EntityManager | null = null
	): Promise<string> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.userRepository,
			User
		);

		const { id: roleId, value } =
			await this.checkUserExistenceAndGetRoleOrFail(
				userId,
				dto.value,
				manager
			);

		const doHaveRole = await this.doUserHaveRole(userId, value, manager);
		if (!doHaveRole) {
			throw new EntityFieldsException(`User didn't have role [${value}]`);
		}

		await repository
			.createQueryBuilder()
			.relation(User, 'roles')
			.of(userId)
			.remove(roleId);

		return `Role [${value}] has been deleted for user with id=${userId}`;
	}

	private async checkUserExistenceAndGetRoleOrFail(
		userId: UserIdType,
		value: string,
		manager: EntityManager | null = null
	): Promise<Role> {
		const role = await this.rolesService.getRoleByValue(value, manager);
		await this.usersService.getUserById(userId, manager);

		return role;
	}

	private async doUserHaveRole(
		userId: UserIdType,
		value: string,
		manager: EntityManager | null = null
	): Promise<boolean> {
		const userRoles = await this.getUserRolesList(userId, manager);

		return userRoles.includes(value);
	}
}
