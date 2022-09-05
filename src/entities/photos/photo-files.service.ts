import { Injectable } from '@nestjs/common';
import { Photo } from './entity/photo.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PhotoFilesService {
	deletePhotoFile(photo: Photo) {
		try {
			const fullFileName = `${photo.filename}.${photo.type}`;
			const photoPath = path.resolve(
				process.env.PHOTOS_DEST,
				fullFileName
			);
			fs.rmSync(photoPath);
		} catch (e) {
			console.error(e);
		}
	}
}
