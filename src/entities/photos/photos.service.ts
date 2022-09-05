import { Injectable } from '@nestjs/common';
import { Photo } from './entity/photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Express } from 'express';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { EntitiesService } from '../entities.service';

@Injectable()
export class PhotosService {
	constructor(
		@InjectRepository(Photo) private photoRepository: Repository<Photo>,
		private entitiesService: EntitiesService
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
		await this.photoRepository.delete(id);
		return photo;
	}
}
