import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Transaction } from './entity/transaction.entity';
import { User } from '../users/entity/user.entity';
import { Product } from '../products/entity/product.entity';

import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import { TransactionKit } from '../../common/types/transaction-kit.interface';
import { TransactionId } from './types/transaction-id.interface';
import { UserIdType } from '../users/types/user-id.interface';
import { ProductIdType } from '../products/types/product-id.interface';

import { EntitiesService } from '../entities.service';

@Injectable()
export class TransactionsService {
	constructor(
		@InjectRepository(Transaction)
		private transactionRepository: Repository<Transaction>,
		private entitiesService: EntitiesService,
		private dataSource: DataSource
	) {}

	async getAllTransactions(
		manager: EntityManager | null = null
	): Promise<Transaction[]> {
		const repository = this.getRepository(manager);
		return repository.createQueryBuilder('transaction').getMany();
	}

	async getTransactionById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Transaction> {
		const repository = this.getRepository(manager);

		return repository
			.createQueryBuilder('transaction')
			.where('transaction.id = :id', { id })
			.getOne();
	}

	async createTransaction(
		transactionDto: CreateTransactionDto
	): Promise<Transaction> {
		const { queryRunner, repository, manager } =
			this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const { userId, productId } = transactionDto;

			await this.getUserAndProductByIdOrFail(userId, productId, manager);

			const transactionId = (
				(
					await repository
						.createQueryBuilder()
						.insert()
						.into(Transaction)
						.values(transactionDto)
						.execute()
				).identifiers as TransactionId[]
			)[0].id;

			const createdTransaction = await repository
				.createQueryBuilder('transaction')
				.leftJoinAndSelect('transaction.user', 'user')
				.leftJoinAndSelect('transaction.product', 'product')
				.where('transaction.id = :transactionId', { transactionId })
				.getOne();

			await queryRunner.commitTransaction();
			return createdTransaction;
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

	async updateTransaction(
		transactionDto: UpdateTransactionDto,
		id: number
	): Promise<Transaction> {
		const { queryRunner, repository, manager } =
			this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const { userId, productId } = transactionDto;

			await this.entitiesService.isExist<Transaction>(
				[{ id }],
				repository
			);
			await this.getUserAndProductByIdOrFail(userId, productId, manager);

			await repository
				.createQueryBuilder()
				.update(Transaction)
				.set(transactionDto)
				.where('id = :id', { id })
				.execute();

			const updatedTransaction = await this.getTransactionById(
				id,
				manager
			);

			await queryRunner.commitTransaction();
			return updatedTransaction;
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

	async deleteTransaction(id: number): Promise<Transaction> {
		const { queryRunner, repository } = this.getQueryRunnerAndRepository();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const transaction = await this.entitiesService.isExist<Transaction>(
				[{ id }],
				repository
			);

			await repository
				.createQueryBuilder()
				.delete()
				.from(Transaction)
				.where('id = :id', { id })
				.execute();

			await queryRunner.commitTransaction();
			return transaction;
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

	private getQueryRunnerAndRepository(): TransactionKit<Transaction> {
		const queryRunner = this.dataSource.createQueryRunner();
		const manager = queryRunner.manager;
		const repository = manager.getRepository(Transaction);

		return { queryRunner, repository, manager };
	}

	private getRepository(
		manager: EntityManager | null = null
	): Repository<Transaction> {
		const repository = manager
			? manager.getRepository(Transaction)
			: this.transactionRepository;

		return repository;
	}

	private async getUserAndProductByIdOrFail(
		userId: UserIdType,
		productId: ProductIdType,
		manager: EntityManager | null = null
	): Promise<{ user: User; product: Product }> {
		const user = await this.entitiesService.isExist<User>(
			[{ id: userId }],
			manager.getRepository(User)
		);

		const product = await this.entitiesService.isExist<Product>(
			[{ id: productId }],
			manager.getRepository(Product)
		);

		return { user, product };
	}
}
