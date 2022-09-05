import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { Photo } from '../photos/entity/photo.entity';
import { PhotosService } from '../photos/photos.service';
import { User } from './entity/user.entity';

@Injectable()
export class UserPhotosService {
	constructor(
		@InjectRepository(Photo) private photoRepository: Repository<Photo>,
		@InjectRepository(User) private userRepository: Repository<User>,
		private entitiesService: EntitiesService,
		private photosService: PhotosService
	) {}

	async getUserPhotos(userId: number): Promise<Photo[]> {
		const user = await this.getUserOrFail(userId);
		return this.photoRepository.find({ where: { user } });
	}

	async addUserPhoto(
		userId: number,
		file: Express.Multer.File
	): Promise<Photo> {
		if (!file) {
			throw new HttpException(
				'File was not provided',
				HttpStatus.BAD_REQUEST
			);
		}

		const user = await this.getUserOrFail(userId);
		const newPhoto = await this.photosService.createPhoto(file);
		user.photos.push(newPhoto);
		await this.userRepository.save(user);
		return newPhoto;
	}

	async deleteUserPhoto(userId: number, photoId: number): Promise<Photo> {
		const user = await this.getUserOrFail(userId);

		const doPhotoBelongsToUser = user.photos.some(
			(photo) => Number(photo.id) === Number(photoId)
		);
		console.log('doPhotoBelongsToUser', doPhotoBelongsToUser);
		if (!doPhotoBelongsToUser) {
			throw new HttpException(
				'User does not have photo with given id',
				HttpStatus.FORBIDDEN
			);
		}

		return this.photosService.deletePhotoById(photoId);
	}

	private async getUserOrFail(id: number): Promise<User> {
		return this.entitiesService.isExist<User>(
			[{ id }],
			this.userRepository,
			{ photos: true }
		);
	}
}
