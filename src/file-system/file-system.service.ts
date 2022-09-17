import * as path from 'path';
import * as fs from 'fs';

import { Injectable } from '@nestjs/common';

@Injectable()
export class FileSystemService {
	deletePhotoFile(filename: string): void {
		console.log('deletePhotoFile', filename);
		try {
			const photoPath = path.resolve(process.env.PHOTOS_DEST, filename);
			fs.rmSync(photoPath);
		} catch (e) {
			console.error(e);
		}
	}
}
