import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { EntityFieldsException } from '../../../common/exceptions/entity-fields.exception';
import { MethodArgumentsException } from '../../../common/exceptions/method-arguments.exception';
import { Repository } from 'typeorm';
import { EntitiesService } from '../../entities.service';
import { Photo } from '../../photos/entity/photo.entity';
import { PhotosService } from '../../photos/photos.service';
import { User } from '../entity/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class UserPhotosService {
	constructor(
		@InjectRepository(Photo) private photoRepository: Repository<Photo>,
		@InjectRepository(User) private userRepository: Repository<User>,
		private entitiesService: EntitiesService,
		private photosService: PhotosService,
		private usersService: UsersService
	) {}

	async getUserPhotos(userId: number): Promise<Photo[]> {
		const user = await this.usersService.getUserById(userId);
		return this.photoRepository.find({ where: { user } });
	}

	async addUserPhoto(
		userId: number,
		file: Express.Multer.File
	): Promise<Photo> {
		if (!file) {
			throw new MethodArgumentsException('File was not provided');
		}

		const user = await this.usersService.getUserById(userId);
		const newPhoto = await this.photosService.createPhoto(file);
		user.photos.push(newPhoto);
		await this.userRepository.save(user);
		return newPhoto;
	}

	async deleteUserPhoto(userId: number, photoId: number): Promise<Photo> {
		const user = await this.usersService.getUserById(userId);

		const doPhotoBelongsToUser = user.photos.some(
			(photo) => Number(photo.id) === Number(photoId)
		);
		if (!doPhotoBelongsToUser) {
			throw new EntityFieldsException(
				`User does not have photo with given id=${photoId}`
			);
		}

		return this.photosService.deletePhotoById(photoId);
	}
}
