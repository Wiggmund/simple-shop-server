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
import { Vendor } from './vendors/entity/vendor.entity';

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
	]
})
export class EntitiesModule {}
