import { Vendor } from '../entity/vendor.entity';

export interface IVendorID {
	id: Pick<Vendor, 'id'>;
}
