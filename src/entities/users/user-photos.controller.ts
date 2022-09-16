import { JwtRolesGuard } from './../../common/guards/jwt-role.guard';
import { RolesEnum } from './../../common/enums/roles.enum';
import {
	Controller,
	Delete,
	Get,
	Param,
	Put,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Roles } from '../../common/decorators/role.decorator';
import { UserPhotosService } from './services/user-photos.service';

@Roles(RolesEnum.Admin)
@UseGuards(JwtRolesGuard)
@Controller('users')
export class UserPhotosController {
	constructor(private userPhotosService: UserPhotosService) {}

	@Get(':id/photos')
	getUserPhotos(@Param('id') id: number) {
		return this.userPhotosService.getUserPhotos(id);
	}

	@Put(':id/photos')
	@UseInterceptors(FileInterceptor('avatar'))
	addUserPhoto(
		@Param('id') id: number,
		@UploadedFile() file: Express.Multer.File
	) {
		return this.userPhotosService.addUserPhoto(id, file);
	}

	@Delete(':id/photos/:photoId')
	deleteUserPhoto(
		@Param('id') id: number,
		@Param('photoId') photoId: number
	) {
		return this.userPhotosService.deleteUserPhoto(id, photoId);
	}
}
