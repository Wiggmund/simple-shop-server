import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entity/vendor.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorUniqueFields } from './types/vendor-unique-fields.interface';
import { EntitiesService } from '../entities.service';

@Injectable()
export class VendorsService {
	private readonly vendorUniqueFieldsToCheck: Partial<VendorUniqueFields>[] =
		[{ company_name: '' }];

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

	async getVendorByCompanyName(
		company_name: string,
		manager: EntityManager | null = null
	): Promise<Vendor> {
		const repository = this.getRepository(manager);
		const candidate = await repository.findOne({
			where: { company_name }
		});

		if (!candidate) {
			throw new HttpException(
				'Vendor with given company_name not found',
				HttpStatus.NOT_FOUND
			);
		}

		return candidate;
	}

	async createVendor(vendorDto: CreateVendorDto): Promise<Vendor> {
		await this.findVendorDublicate<CreateVendorDto>(vendorDto);

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
		await this.findVendorDublicate<UpdateVendorDto>(vendorDto);

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

	private async findVendorDublicate<D>(vendorDto: D): Promise<Vendor> {
		return await this.entitiesService.checkForDublicates2<D, Vendor>(
			vendorDto,
			this.vendorUniqueFieldsToCheck,
			this.vendorRepository
		);
	}

	private getRepository(
		manager: EntityManager | null = null
	): Repository<Vendor> {
		const repository = manager
			? manager.getRepository(Vendor)
			: this.vendorRepository;

		return repository;
	}
}
