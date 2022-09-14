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
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';

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
	createRole(@Body(DtoValidationPipe) roleDto: CreateRoleDto) {
		return this.rolesService.createRole(roleDto);
	}

	@Put(':id')
	updateRole(
		@Body(DtoValidationPipe) roleDto: UpdateRoleDto,
		@Param('id') id: number
	) {
		return this.rolesService.updateRole(roleDto, id);
	}

	@Delete(':id')
	deleteRole(@Param('id') id: number) {
		return this.rolesService.deleteRole(id);
	}
}
