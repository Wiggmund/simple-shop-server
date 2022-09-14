import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DataSource,
	EntityManager,
	FindOptionsWhere,
	Repository
} from 'typeorm';

import { Role } from './entity/role.entity';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { EntitiesService } from '../entities.service';

import { RoleUniqueFields } from './types/role-unique-fields.interface';
import { TransactionKit } from '../../common/types/transaction-kit.interface';
import { RoleId } from './types/role-id.interface';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';

@Injectable()
export class RolesService {
	private readonly roleUniqueFieldsToCheck: FindOptionsWhere<RoleUniqueFields>[] =
		[{ value: '' }];

	private uniqueFields: string[] = this.roleUniqueFieldsToCheck
		.map((option) => Object.keys(option))
		.flat();

	constructor(
		@InjectRepository(Role) private roleRepository: Repository<Role>,
		private entitiesService: EntitiesService,
		private dataSource: DataSource
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

		return repository
			.createQueryBuilder('role')
			.where('role.id = :id', { id })
			.getOne();
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

		return await repository
			.createQueryBuilder('role')
			.where('role.value = :value', { value })
			.getOne();
	}

	async getRoleByValueOrFail(
		value: string,
		manager: EntityManager | null = null
	): Promise<Role> {
		const candidate = await this.getRoleByValue(value, manager);

		if (!candidate) {
			throw new HttpException(
				`Role with given value=${value} not found`,
				HttpStatus.BAD_REQUEST
			);
		}

		return candidate;
	}

	async createRole(roleDto: CreateRoleDto): Promise<Role> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.findRoleDublicate<CreateRoleDto>(
				null,
				roleDto,
				repository
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

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async updateRole(roleDto: UpdateRoleDto, id: number): Promise<Role> {
		const { queryRunner, repository, manager } =
			this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const role = await this.entitiesService.isExist<Role>(
				[{ id }],
				repository
			);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateRoleDto>(
					roleDto,
					this.uniqueFields
				)
			) {
				await this.findRoleDublicate<UpdateRoleDto>(
					role,
					roleDto,
					repository
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

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteRole(id: number): Promise<Role> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const role = await this.entitiesService.isExist<Role>(
				[{ id }],
				repository
			);

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

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	private async findRoleDublicate<D>(
		role: Role,
		roleDto: D,
		repository: Repository<Role>
	): Promise<void> {
		const findOptions =
			this.entitiesService.getFindOptionsToFindDublicates<Role>(
				role,
				roleDto,
				this.roleUniqueFieldsToCheck
			);

		return await this.entitiesService.checkForDublicates<Role>(
			repository,
			findOptions,
			'Role'
		);
	}

	private getQueryRunnerAndRepository(): TransactionKit<Role> {
		const queryRunner = this.dataSource.createQueryRunner();
		const manager = queryRunner.manager;
		const repository = manager.getRepository(Role);

		return { queryRunner, repository, manager };
	}
}
