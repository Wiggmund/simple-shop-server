import { Injectable } from '@nestjs/common';
import { Photo } from './entity/photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Express } from 'express';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { EntitiesService } from '../entities.service';
import { PhotoFilesService } from './photo-files.service';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class PhotosService {
	constructor(
		@InjectRepository(Photo) private photoRepository: Repository<Photo>,
		private entitiesService: EntitiesService,
		private photoFilesService: PhotoFilesService
	) {}

	async getAllPhotos(): Promise<Photo[]> {
		return this.photoRepository.find();
	}

	async getPhotoById(id: number) {
		return this.photoRepository.find({ where: { id } });
	}

	async createPhoto(file: Express.Multer.File): Promise<Photo> {
		const photoDto = new CreatePhotoDto(file);
		const photo = this.photoRepository.create(photoDto);
		return this.photoRepository.save(photo);
	}

	async deletePhotoById(id: number) {
		const photo = await this.entitiesService.isExist<Photo>(
			[{ id }],
			this.photoRepository
		);
		this.photoFilesService.deletePhotoFile(photo);
		await this.photoRepository.delete(id);
		return photo;
	}

	async deleteManyPhotosByCriteria(
		findOptions: FindOptionsWhere<Photo>[]
	): Promise<Photo[]> {
		const photos = await this.photoRepository.find({
			where: findOptions
		});
		photos.forEach((photo) =>
			this.photoFilesService.deletePhotoFile(photo)
		);
		return this.photoRepository.remove([...photos]);
	}
}
