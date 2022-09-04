import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entity/transaction.entity';
import { Repository } from 'typeorm';
import { EntitiesService } from '../entities.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
	constructor(
		@InjectRepository(Transaction)
		private transactionRepository: Repository<Transaction>,
		private entitiesService: EntitiesService
	) {}

	async getAllTransactions(): Promise<Transaction[]> {
		return this.transactionRepository.find();
	}

	async getTransactionById(id: number): Promise<Transaction> {
		return this.transactionRepository.findOne({ where: { id } });
	}

	async createTransaction(
		transactionDto: CreateTransactionDto
	): Promise<Transaction> {
		const newTransaction =
			this.transactionRepository.create(transactionDto);
		return this.transactionRepository.save(newTransaction);
	}

	async updateTransaction(
		transactionDto: UpdateTransactionDto,
		id: number
	): Promise<Transaction> {
		await this.entitiesService.isExist<Transaction>(
			[{ id }],
			this.transactionRepository
		);

		await this.transactionRepository.update(id, transactionDto);
		// Get updated data about transaction and return it
		return await this.getTransactionById(id);
	}

	async deleteTransaction(id: number): Promise<Transaction> {
		const transaction = await this.entitiesService.isExist<Transaction>(
			[{ id }],
			this.transactionRepository
		);
		await this.transactionRepository.delete(id);
		return transaction;
	}
}
