import { Injectable } from '@nestjs/common';
import { FileSystemService } from '../../file-system/file-system.service';
import { Photo } from './entity/photo.entity';

@Injectable()
export class PhotoFilesService {
	constructor(private fileSystemService: FileSystemService) {}

	deletePhotoFile(photo: Photo): void {
		const fullFileName = `${photo.filename}.${photo.type}`;
		this.fileSystemService.deletePhotoFile(fullFileName);
	}
}
