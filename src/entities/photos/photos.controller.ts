import { RolesEnum } from './../../common/enums/roles.enum';
import { JwtRolesGuard } from './../../common/guards/jwt-role.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Roles } from '../../common/decorators/role.decorator';
import { PhotosService } from './photos.service';

@Roles(RolesEnum.Admin)
@UseGuards(JwtRolesGuard)
@Controller('photos')
export class PhotosController {
	constructor(private photosService: PhotosService) {}

	@Get()
	getAllPhotos() {
		return this.photosService.getAllPhotos();
	}

	@Get(':id')
	getPhotoById(@Param('id') id: number) {
		return this.photosService.getPhotoById(id);
	}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
		const res = JSON.stringify(file, null, 4);
		return res;
	}

	@Delete(':id')
	deleteUser(@Param('id') id: number) {
		return this.photosService.deletePhotoById(id);
	}
}
