import { Attribute } from 'src/entities/attributes/entity/attribute.entity';
import { Category } from 'src/entities/categories/entity/category.entity';
import { Comment } from 'src/entities/comments/entity/comment.entity';
import { Photo } from 'src/entities/photos/entity/photo.entity';
import { Transaction } from 'src/entities/transactions/entity/transaction.entity';
import { Vendor } from 'src/entities/vendors/entity/vendor.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	product_name: string;

	@Column()
	description: string;

	@Column('float4')
	price: number;

	@Column()
	quantity: number;

	@Column()
	isActive: boolean;

	@ManyToMany(() => Attribute, (attribute) => attribute.products)
	@JoinTable()
	attributes: Attribute[];

	@ManyToOne(() => Category, (category) => category.products)
	category: Category;

	@ManyToOne(() => Vendor, (vendor) => vendor.products)
	vendor: Vendor;

	@OneToMany(() => Photo, (photo) => photo.product)
	photos: Photo[];

	@OneToMany(() => Comment, (comment) => comment.product)
	comments: Comment[];

	@OneToMany(() => Transaction, (transaction) => transaction.product)
	transactions: Transaction[];
}
