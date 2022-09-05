import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('photos')
export class PhotosController {
	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
		const res = JSON.stringify(file, null, 4);
		console.log(res);
		console.log('BODY', JSON.stringify(body, null, 4));
		return res;
	}
}
