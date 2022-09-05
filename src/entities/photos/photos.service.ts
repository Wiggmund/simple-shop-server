import { Injectable } from '@nestjs/common';
import { Photo } from './entity/photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Express } from 'express';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Injectable()
export class PhotosService {
	constructor(@InjectRepository(Photo) private photoRepository: Repository<Photo>) {}

	async createPhoto(file: Express.Multer.File): Promise<Photo> {
		const photoDto = new CreatePhotoDto(file);
		const photo = this.photoRepository.create(photoDto);
		return this.photoRepository.save(photo);
	}
}
