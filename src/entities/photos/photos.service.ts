import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { EntityManager, Repository } from 'typeorm';

import { Photo } from './entity/photo.entity';

import { CreatePhotoDto } from './dto/create-photo.dto';

import { EntitiesService } from '../entities.service';
import { PhotoFilesService } from './photo-files.service';

import { PhotoId, PhotoIdType } from './types/photo-id.interface';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';

@Injectable()
export class PhotosService {
	constructor(
		@InjectRepository(Photo) private photoRepository: Repository<Photo>,
		private entitiesService: EntitiesService,
		private photoFilesService: PhotoFilesService
	) {}

	async getAllPhotos(manager: EntityManager | null = null): Promise<Photo[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.photoRepository,
			Photo
		);

		return repository.createQueryBuilder('photo').getMany();
	}

	async getPhotoById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Photo> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.photoRepository,
			Photo
		);

		const candidate = await repository
			.createQueryBuilder('photo')
			.where('photo.id = :id', { id })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`Photo with given id=${id} not found`
			);
		}

		return candidate;
	}

	async createPhoto(
		file: Express.Multer.File,
		manager: EntityManager | null = null
	): Promise<Photo> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.photoRepository,
			Photo
		);

		const photoDto = new CreatePhotoDto(file);

		const photoId = (
			(
				await repository
					.createQueryBuilder()
					.insert()
					.into(Photo)
					.values(photoDto)
					.execute()
			).identifiers as PhotoId[]
		)[0].id;

		const createdPhoto = await repository
			.createQueryBuilder('photo')
			.where('photo.id = :photoId', { photoId })
			.getOne();

		return createdPhoto;
	}

	async deletePhotoById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Photo> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.photoRepository,
			Photo
		);

		const photo = await this.getPhotoById(id, manager);

		this.photoFilesService.deletePhotoFile(photo);

		await repository
			.createQueryBuilder()
			.delete()
			.from(Photo)
			.where('id = :id', { id })
			.execute();

		return photo;
	}

	async deleteManyPhotosByIds(
		ids: PhotoIdType[],
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.photoRepository,
			Photo
		);

		if (ids.length > 0) {
			const photos = await repository
				.createQueryBuilder('photo')
				.select(['photo.filename', 'photo.type'])
				.where('photo.id IN (:...ids)', { ids })
				.getMany();

			this.photoFilesService.deleteManyPhotoFiles(photos);

			await repository
				.createQueryBuilder()
				.delete()
				.from(Photo)
				.where('id IN (:...ids)', { ids })
				.execute();
		}
	}
}
