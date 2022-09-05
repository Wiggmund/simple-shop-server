import { Product } from '../entity/product.entity';

export type ProductUniqueFields = Pick<Product, 'product_name'>;
