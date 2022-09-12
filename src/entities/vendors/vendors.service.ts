import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DataSource,
	EntityManager,
	FindOptionsWhere,
	Repository
} from 'typeorm';

import { Vendor } from './entity/vendor.entity';

import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

import { VendorUniqueFields } from './types/vendor-unique-fields.interface';
import { TransactionKit } from '../../common/types/transaction-kit.interface';
import { IVendorID } from './types/vendor-id.interface';

import { EntitiesService } from '../entities.service';

@Injectable()
export class VendorsService {
	private readonly vendorUniqueFieldsToCheck: FindOptionsWhere<VendorUniqueFields>[] =
		[{ company_name: '' }];

	private uniqueFields: string[] = this.vendorUniqueFieldsToCheck
		.map((option) => Object.keys(option))
		.flat();

	constructor(
		@InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
		private entitiesService: EntitiesService,
		private dataSource: DataSource
	) {}

	async getAllVendors(
		manager: EntityManager | null = null
	): Promise<Vendor[]> {
		const repository = this.getRepository(manager);
		return repository.createQueryBuilder('vendor').getMany();
	}

	async getVendorById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Vendor> {
		const repository = this.getRepository(manager);

		return repository
			.createQueryBuilder('vendor')
			.where('vendor.id = :id', { id })
			.getOne();
	}

	async getVendorByCompanyName(
		company_name: string,
		manager: EntityManager | null = null
	): Promise<Vendor> {
		const repository = this.getRepository(manager);

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
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await this.findVendorDublicate<CreateVendorDto>(
				null,
				vendorDto,
				repository
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
			this.getQueryRunnerAndRepository();

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
				await this.findVendorDublicate<UpdateVendorDto>(
					vendor,
					vendorDto,
					repository
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
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

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

	private async findVendorDublicate<D>(
		vendor: Vendor,
		vendorDto: D,
		repository: Repository<Vendor>
	): Promise<void> {
		const findOptions =
			this.entitiesService.getFindOptionsToFindDublicates<Vendor>(
				vendor,
				vendorDto,
				this.vendorUniqueFieldsToCheck
			);

		return await this.entitiesService.checkForDublicates<Vendor>(
			repository,
			findOptions,
			'Vendor'
		);
	}

	private getQueryRunnerAndRepository(): TransactionKit<Vendor> {
		const queryRunner = this.dataSource.createQueryRunner();
		const manager = queryRunner.manager;
		const repository = manager.getRepository(Vendor);

		return { queryRunner, repository, manager };
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
