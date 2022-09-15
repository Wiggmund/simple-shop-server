import { Injectable } from '@nestjs/common';
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
			User
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
		const userRoles = (await this.getUserRoles(userId, manager)).map(
			(role) => role.value
		);
		console.log('userRoles', userRoles);
		return userRoles.includes(value);
	}
}
