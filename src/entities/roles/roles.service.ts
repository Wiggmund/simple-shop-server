import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';

import { Role } from './entity/role.entity';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { EntitiesService } from '../entities.service';

import { RoleUniqueFields } from './types/role-unique-fields.interface';
import { RoleId } from './types/role-id.interface';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { DatabaseInternalException } from '../../common/exceptions/database-internal.exception';

@Injectable()
export class RolesService {
	private readonly roleUniqueFieldsToCheck: FindOptionsWhere<RoleUniqueFields>[] =
		[{ value: '' }];

	private uniqueFields: string[] = this.roleUniqueFieldsToCheck
		.map((option) => Object.keys(option))
		.flat();

	constructor(
		@InjectRepository(Role) private roleRepository: Repository<Role>,
		private entitiesService: EntitiesService
	) {}

	async getAllRoles(manager: EntityManager | null = null): Promise<Role[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.roleRepository,
			AvailableEntitiesEnum.Role
		);

		return repository.createQueryBuilder('role').getMany();
	}

	async getRoleById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Role> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.roleRepository,
			AvailableEntitiesEnum.Role
		);

		const candidate = await repository
			.createQueryBuilder('role')
			.where('role.id = :id', { id })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`Role with given id=${id} not found`
			);
		}

		return candidate;
	}

	async getRoleByValue(
		value: string,
		manager: EntityManager | null = null
	): Promise<Role> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.roleRepository,
			AvailableEntitiesEnum.Role
		);

		const candidate = await repository
			.createQueryBuilder('role')
			.where('role.value = :value', { value })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`Role with given value=${value} not found`
			);
		}

		return candidate;
	}

	async createRole(roleDto: CreateRoleDto): Promise<Role> {
		const { queryRunner, repository } =
			this.entitiesService.getTransactionKit<Role>(
				AvailableEntitiesEnum.Role
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.entitiesService.findEntityDuplicate<Role>(
				null,
				roleDto,
				repository,
				this.roleUniqueFieldsToCheck
			);

			const roleId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(Role)
						.values(roleDto)
						.execute()
				).identifiers as RoleId[]
			)[0].id;

			const createdRole = await repository
				.createQueryBuilder('role')
				.where('role.id = :roleId', { roleId })
				.getOne();

			await queryRunner.commitTransaction();
			return createdRole;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async updateRole(roleDto: UpdateRoleDto, id: number): Promise<Role> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Role>(
				AvailableEntitiesEnum.Role
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const role = await this.getRoleById(id, manager);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateRoleDto>(
					roleDto,
					this.uniqueFields
				)
			) {
				await this.entitiesService.findEntityDuplicate<Role>(
					role,
					roleDto,
					repository,
					this.roleUniqueFieldsToCheck
				);
			}

			await repository
				.createQueryBuilder()
				.update(Role)
				.set(roleDto)
				.where('id = :id', { id })
				.execute();

			const updatedRole = await this.getRoleById(id, manager);

			await queryRunner.commitTransaction();
			return updatedRole;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteRole(id: number): Promise<Role> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Role>(
				AvailableEntitiesEnum.Role
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const role = await this.getRoleById(id, manager);

			await repository
				.createQueryBuilder()
				.delete()
				.from(Role)
				.where('id = :id', { id })
				.execute();

			await queryRunner.commitTransaction();
			return role;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}
}
