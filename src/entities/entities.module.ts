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
		])
	],
	controllers: [UsersController, VendorsController],
	providers: [EntitiesService, UsersService, VendorsService]
})
export class EntitiesModule {}
