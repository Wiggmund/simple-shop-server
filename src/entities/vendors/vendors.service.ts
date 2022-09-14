import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';

import { Vendor } from './entity/vendor.entity';

import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

import { VendorUniqueFields } from './types/vendor-unique-fields.interface';
import { IVendorID } from './types/vendor-id.interface';

import { EntitiesService } from '../entities.service';
import { AvailableEntitiesEnum } from '../../common/enums/available-entities.enum';

@Injectable()
export class VendorsService {
	private readonly vendorUniqueFieldsToCheck: FindOptionsWhere<VendorUniqueFields>[] =
		[{ company_name: '' }];

	private uniqueFields: string[] = this.vendorUniqueFieldsToCheck
		.map((option) => Object.keys(option))
		.flat();

	constructor(
		@InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
		private entitiesService: EntitiesService
	) {}

	async getAllVendors(
		manager: EntityManager | null = null
	): Promise<Vendor[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.vendorRepository,
			AvailableEntitiesEnum.Vendor
		);

		return repository.createQueryBuilder('vendor').getMany();
	}

	async getVendorById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Vendor> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.vendorRepository,
			AvailableEntitiesEnum.Vendor
		);

		return repository
			.createQueryBuilder('vendor')
			.where('vendor.id = :id', { id })
			.getOne();
	}

	async getVendorByCompanyName(
		company_name: string,
		manager: EntityManager | null = null
	): Promise<Vendor> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.vendorRepository,
			AvailableEntitiesEnum.Vendor
		);

		const candidate = await repository
			.createQueryBuilder('vendor')
			.where('vendor.company_name = :company_name', { company_name })
			.getOne();

		if (!candidate) {
			throw new HttpException(
				`Vendor with given company_name=${company_name} not found`,
				HttpStatus.NOT_FOUND
			);
		}

		return candidate;
	}

	async createVendor(vendorDto: CreateVendorDto): Promise<Vendor> {
		const { queryRunner, repository } =
			this.entitiesService.getTransactionKit<Vendor>(
				AvailableEntitiesEnum.Vendor
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.entitiesService.findEntityDublicate<Vendor>(
				null,
				vendorDto,
				repository,
				this.vendorUniqueFieldsToCheck
			);

			const vendorId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(Vendor)
						.values(vendorDto)
						.execute()
				).identifiers as IVendorID[]
			)[0].id;

			const createdVendor = await repository
				.createQueryBuilder('vendor')
				.where('vendor.id = :vendorId', { vendorId })
				.getOne();

			await queryRunner.commitTransaction();
			return createdVendor;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async updateVendor(
		vendorDto: UpdateVendorDto,
		id: number
	): Promise<Vendor> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Vendor>(
				AvailableEntitiesEnum.Vendor
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const vendor = await this.entitiesService.isExist<Vendor>(
				[{ id }],
				repository
			);

			if (
				this.entitiesService.doDtoHaveUniqueFields<UpdateVendorDto>(
					vendorDto,
					this.uniqueFields
				)
			) {
				await this.entitiesService.findEntityDublicate<Vendor>(
					vendor,
					vendorDto,
					repository,
					this.vendorUniqueFieldsToCheck
				);
			}

			await repository
				.createQueryBuilder()
				.update(Vendor)
				.set(vendorDto)
				.where('id = :id', { id })
				.execute();

			const updatedVendor = await this.getVendorById(id, manager);

			await queryRunner.commitTransaction();
			return updatedVendor;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteVendor(id: number): Promise<Vendor> {
		const { queryRunner, repository } =
			this.entitiesService.getTransactionKit<Vendor>(
				AvailableEntitiesEnum.Vendor
			);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const vendor = await this.entitiesService.isExist<Vendor>(
				[{ id }],
				repository
			);

			await repository
				.createQueryBuilder()
				.delete()
				.from(Vendor)
				.where('id = :id', { id })
				.execute();

			await queryRunner.commitTransaction();
			return vendor;
		} catch (err) {
			await queryRunner.rollbackTransaction();

			if (err instanceof HttpException) {
				throw err;
			}

			throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}
}
