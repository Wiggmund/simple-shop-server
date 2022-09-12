import { Product } from '../entity/product.entity';

export type ProductUniqueConditions = Pick<Product, 'product_name'>;
export type ProductUniqueFields = keyof ProductUniqueConditions;
