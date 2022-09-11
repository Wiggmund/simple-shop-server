import { Injectable } from '@nestjs/common';
import { Photo } from './entity/photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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

	async createPhoto(
		file: Express.Multer.File,
		manager: EntityManager | null = null
	): Promise<Photo> {
		const repository = manager
			? manager.getRepository(Photo)
			: this.photoRepository;

		const photoDto = new CreatePhotoDto(file);
		const photo = repository.create(photoDto);
		return repository.save(photo);
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
		findOptions: FindOptionsWhere<Photo>[],
		manager: EntityManager | null = null
	): Promise<Photo[]> {
		const repository = this.getRepository(manager);

		const photos = await repository.find({
			where: findOptions
		});
		photos.forEach((photo) =>
			this.photoFilesService.deletePhotoFile(photo)
		);

		return repository.remove([...photos]);
	}

	private getRepository(
		manager: EntityManager | null = null
	): Repository<Photo> {
		const repository = manager
			? manager.getRepository(Photo)
			: this.photoRepository;

		return repository;
	}
}
