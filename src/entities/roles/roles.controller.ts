import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('roles')
export class RolesController {
	constructor(private rolesService: RolesService) {}

	@Get()
	getAllRoles() {
		return this.rolesService.getAllRoles();
	}

	@Get(':id')
	getRoleById(@Param('id') id: number) {
		return this.rolesService.getRoleById(id);
	}

	@Post()
	createRole(@Body() roleDto: CreateRoleDto) {
		return this.rolesService.createRole(roleDto);
	}

	@Put(':id')
	updateRole(@Body() roleDto: UpdateRoleDto, @Param('id') id: number) {
		return this.rolesService.updateRole(roleDto, id);
	}

	@Delete(':id')
	deleteRole(@Param('id') id: number) {
		return this.rolesService.deleteRole(id);
	}
}
