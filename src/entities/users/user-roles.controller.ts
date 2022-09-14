import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';
import { AddDeleteUserRoleDto } from './dto/add-delete-user-role.dto';
import { UserRolesService } from './services/user-roles.service';
import { UserIdType } from './types/user-id.interface';

@Controller('users')
export class UserRolesController {
	constructor(private userRolesService: UserRolesService) {}

	@Get(':id/roles')
	getUserPhotos(@Param('id') id: UserIdType) {
		return this.userRolesService.getUserRoles(id);
	}

	@Put(':id/roles')
	addUserRole(
		@Param('id') id: UserIdType,
		@Body(DtoValidationPipe) dto: AddDeleteUserRoleDto
	) {
		return this.userRolesService.addUserRole(id, dto);
	}

	@Delete(':id/roles')
	deleteUserRole(
		@Param('id') id: UserIdType,
		@Body(DtoValidationPipe) dto: AddDeleteUserRoleDto
	) {
		return this.userRolesService.deleteUserRole(id, dto);
	}
}
