import { Attribute } from '../../attributes/entity/attribute.entity';
import { Category } from '../../categories/entity/category.entity';
import { Comment } from '../../comments/entity/comment.entity';
import { Photo } from '../../photos/entity/photo.entity';
import { Transaction } from '../../transactions/entity/transaction.entity';
import { Vendor } from '../../vendors/entity/vendor.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm';

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	product_name: string;

	@Column()
	description: string;

	@Column('float4')
	price: number;

	@Column({ default: 0 })
	quantity: number;

	@Column({ default: true })
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
