import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Transaction } from './entity/transaction.entity';
import { User } from '../users/entity/user.entity';
import { Product } from '../products/entity/product.entity';

import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import {
	TransactionId,
	TransactionIdType
} from './types/transaction-id.interface';
import { UserIdType } from '../users/types/user-id.interface';
import { ProductIdType } from '../products/types/product-id.interface';
import { TransactionRelatedEntities } from './types/transaction-related-entities.interface';

import { EntitiesService } from '../entities.service';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { UsersService } from '../users/services/users.service';
import { ProductsService } from '../products/products.service';
import { DatabaseInternalException } from '../../common/exceptions/database-internal.exception';

@Injectable()
export class TransactionsService {
	constructor(
		@InjectRepository(Transaction)
		private transactionRepository: Repository<Transaction>,
		private entitiesService: EntitiesService,

		@Inject(forwardRef(() => ProductsService))
		private productsService: ProductsService,

		@Inject(forwardRef(() => UsersService))
		private usersService: UsersService
	) {}

	async getAllTransactions(
		manager: EntityManager | null = null
	): Promise<Transaction[]> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.transactionRepository,
			Transaction
		);

		return repository.createQueryBuilder('transaction').getMany();
	}

	async getTransactionById(
		id: number,
		manager: EntityManager | null = null
	): Promise<Transaction> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.transactionRepository,
			Transaction
		);

		const candidate = await repository
			.createQueryBuilder('transaction')
			.where('transaction.id = :id', { id })
			.getOne();

		if (!candidate) {
			throw new EntityNotFoundException(
				`Transaction with given id=${id} not found`
			);
		}

		return candidate;
	}

	async createTransaction(
		transactionDto: CreateTransactionDto
	): Promise<Transaction> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Transaction>(Transaction);

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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async updateTransaction(
		transactionDto: UpdateTransactionDto,
		id: number
	): Promise<Transaction> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Transaction>(Transaction);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const { userId, productId } = transactionDto;

			const isTransaction =
				await this.entitiesService.isExist<Transaction>(
					manager,
					{ id },
					Transaction
				);
			if (!isTransaction) {
				throw new EntityNotFoundException(
					`Transaction with given id=${id} not found`
				);
			}

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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async deleteTransaction(id: number): Promise<Transaction> {
		const { queryRunner, repository, manager } =
			this.entitiesService.getTransactionKit<Transaction>(Transaction);

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const transaction = await this.getTransactionById(id, manager);

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

			throw new DatabaseInternalException(err);
		} finally {
			await queryRunner.release();
		}
	}

	async unbindEntities(
		relatedEntity: TransactionRelatedEntities,
		ids: TransactionIdType[],
		manager: EntityManager | null = null
	): Promise<void> {
		const repository = this.entitiesService.getRepository(
			manager,
			this.transactionRepository,
			Transaction
		);

		switch (relatedEntity) {
			case 'product':
				await this.unbindProducts(ids, repository);
				break;

			case 'user':
				await this.unbindUsers(ids, repository);
				break;
		}
	}

	private async unbindProducts(
		ids: TransactionIdType[],
		repository: Repository<Transaction>
	): Promise<void> {
		await repository
			.createQueryBuilder()
			.relation(Transaction, 'product')
			.of(ids)
			.set(null);
	}

	private async unbindUsers(
		ids: UserIdType[],
		repository: Repository<Transaction>
	): Promise<void> {
		await repository
			.createQueryBuilder()
			.relation(Transaction, 'user')
			.of(ids)
			.set(null);
	}

	private async getUserAndProductByIdOrFail(
		userId: UserIdType,
		productId: ProductIdType,
		manager: EntityManager | null = null
	): Promise<{ user: User; product: Product }> {
		const user = await this.usersService.getUserById(userId, manager);
		const product = await this.productsService.getProductById(
			productId,
			manager
		);

		return { user, product };
	}
}
