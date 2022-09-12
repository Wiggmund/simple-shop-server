import { Injectable } from '@nestjs/common';
import { Photo } from './entity/photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Express } from 'express';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { EntitiesService } from '../entities.service';
import { PhotoFilesService } from './photo-files.service';
import { FindOptionsWhere } from 'typeorm';
import { PhotoRelatedEntities } from './types/photo-related-entities.interface';

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

	async deleteManyPhotos(
		relatedEntity: PhotoRelatedEntities,
		id: number,
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.getRepository(manager);

		switch (relatedEntity) {
			case 'product':
				await this.deleteManyPhotosByProductId(id, repository);
				break;
			case 'user':
				await this.deleteManyPhotosByUserId(id, repository);
				break;
		}
	}

	private async deleteManyPhotosByProductId(
		productId: number,
		repository: Repository<Photo>
	): Promise<void> {
		const photos = await repository
			.createQueryBuilder('photo')
			.select(['photo.filename', 'photo.type'])
			.where('photo.productId = :productId', { productId })
			.getMany();

		this.photoFilesService.deleteManyPhotoFiles(photos);

		await repository
			.createQueryBuilder()
			.delete()
			.from(Photo)
			.where('productId = :productId', { productId })
			.execute();
	}

	private async deleteManyPhotosByUserId(
		userId: number,
		repository: Repository<Photo>
	): Promise<void> {
		const photos = await repository
			.createQueryBuilder('photo')
			.select(['photo.filename', 'photo.type'])
			.where('photo.userId = :userId', { userId })
			.getMany();

		this.photoFilesService.deleteManyPhotoFiles(photos);

		await repository
			.createQueryBuilder()
			.delete()
			.from(Photo)
			.where('userId = :userId', { userId })
			.execute();
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
