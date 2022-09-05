import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './attributes/entity/attribute.entity';
import { Category } from './categories/entity/category.entity';
import { Comment } from './comments/entity/comment.entity';
import { Photo } from './photos/entity/photo.entity';
import { Product } from './products/entity/product.entity';
import { Role } from './roles/entity/role.entity';
import { Transaction } from './transactions/entity/transaction.entity';
import { User } from './users/entity/user.entity';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { Vendor } from './vendors/entity/vendor.entity';
import { VendorsController } from './vendors/vendors.controller';
import { VendorsService } from './vendors/vendors.service';
import { EntitiesService } from './entities.service';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';
import { RolesService } from './roles/roles.service';
import { RolesController } from './roles/roles.controller';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsController } from './comments/comments.controller';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { AttributesService } from './attributes/attributes.service';
import { AttributesController } from './attributes/attributes.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { Request } from 'express';
import { PhotosController } from './photos/photos.controller';
import { PhotosService } from './photos/photos.service';
import { UserPhotosController } from './users/user-photos.controller';
import { UserPhotosService } from './users/user-photos.service';
import { PhotoFilesService } from './photos/photo-files.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			Product,
			Category,
			Vendor,
			Transaction,
			Attribute,
			Comment,
			Role,
			Photo
		]),
		MulterModule.register({
			storage: diskStorage({
				destination: function (req, file, cb) {
					if (!fs.existsSync(process.env.PHOTOS_DEST)) {
						fs.mkdirSync(process.env.PHOTOS_DEST);
					}
					cb(null, process.env.PHOTOS_DEST);
				},
				filename: function (
					req: Request,
					file: Express.Multer.File,
					cb
				) {
					const type = file.mimetype.split('/')[1];
					cb(null, `${uuid.v4()}.${type}`);
				}
			})
		})
	],
	controllers: [
		UsersController,
		UserPhotosController,
		VendorsController,
		TransactionsController,
		RolesController,
		ProductsController,
		CommentsController,
		CategoriesController,
		AttributesController,
		PhotosController
	],
	providers: [
		EntitiesService,
		UsersService,
		UserPhotosService,
		VendorsService,
		TransactionsService,
		RolesService,
		ProductsService,
		CommentsService,
		CategoriesService,
		AttributesService,
		PhotosService,
		PhotoFilesService
	]
})
export class EntitiesModule {}
