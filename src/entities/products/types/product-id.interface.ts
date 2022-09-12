import { Product } from '../entity/product.entity';

export type ProductId = Pick<Product, 'id'>;

const temp: ProductId = {
	id: 1
};
type key = keyof ProductId;

export type ProductIdType = typeof temp[key];
