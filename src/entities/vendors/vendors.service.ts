import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entity/vendor.entity';
import { Repository } from 'typeorm';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { IVendorUniqueFields } from './types/vendor-unique-fields.interface';
import { EntitiesService } from '../entities.service';

@Injectable()
export class VendorsService {
	constructor(
		@InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
		private entitiesService: EntitiesService
	) {}

	async getAllVendors(): Promise<Vendor[]> {
		return this.vendorRepository.find();
	}

	async getVendorById(id: number): Promise<Vendor> {
		return this.vendorRepository.findOne({ where: { id } });
	}

	async createVendor(vendorDto: CreateVendorDto): Promise<Vendor> {
		await this.entitiesService.checkForDublicates<
			CreateVendorDto,
			IVendorUniqueFields,
			Vendor
		>(vendorDto, { company_name: '' }, this.vendorRepository);

		const newVendor = this.vendorRepository.create(vendorDto);
		return this.vendorRepository.save(newVendor);
	}

	async updateVendor(
		vendorDto: UpdateVendorDto,
		id: number
	): Promise<Vendor> {
		await this.entitiesService.isExist<Vendor>(
			[{ id }],
			this.vendorRepository
		);
		await this.entitiesService.checkForDublicates<
			UpdateVendorDto,
			IVendorUniqueFields,
			Vendor
		>(vendorDto, { company_name: '' }, this.vendorRepository);

		await this.vendorRepository.update(id, vendorDto);
		// Get updated data about vendor and return it
		return await this.getVendorById(id);
	}

	async deleteVendor(id: number): Promise<Vendor> {
		const vendor = await this.entitiesService.isExist<Vendor>(
			[{ id }],
			this.vendorRepository
		);
		await this.vendorRepository.delete(id);
		return vendor;
	}
}
