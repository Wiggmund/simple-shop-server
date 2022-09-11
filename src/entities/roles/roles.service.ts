import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { Role } from './entity/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleUniqueFields } from './types/role-unique-fields.interface';

@Injectable()
export class RolesService {
	private readonly roleUniqueFieldsToCheck: Partial<RoleUniqueFields>[] = [
		{ value: '' }
	];

	constructor(
		@InjectRepository(Role) private roleRepository: Repository<Role>,
		private entitiesService: EntitiesService
	) {}

	async getAllRoles(): Promise<Role[]> {
		return this.roleRepository.find();
	}

	async getRoleById(id: number): Promise<Role> {
		return this.roleRepository.findOne({ where: { id } });
	}

	async createRole(roleDto: CreateRoleDto): Promise<Role> {
		await this.findRoleDublicate<CreateRoleDto>(roleDto);
		const newRole = this.roleRepository.create(roleDto);
		return this.roleRepository.save(newRole);
	}

	async updateRole(roleDto: UpdateRoleDto, id: number): Promise<Role> {
		await this.entitiesService.isExist<Role>([{ id }], this.roleRepository);
		await this.findRoleDublicate<UpdateRoleDto>(roleDto);

		await this.roleRepository.update(id, roleDto);
		// Get updated data about role and return it
		return await this.getRoleById(id);
	}

	async deleteRole(id: number): Promise<Role> {
		const role = await this.entitiesService.isExist<Role>(
			[{ id }],
			this.roleRepository
		);
		await this.roleRepository.delete(id);
		return role;
	}

	private async findRoleDublicate<D>(roleDto: D): Promise<Role> {
		return await this.entitiesService.checkForDublicates2<D, Role>(
			roleDto,
			this.roleUniqueFieldsToCheck,
			this.roleRepository
		);
	}
}
