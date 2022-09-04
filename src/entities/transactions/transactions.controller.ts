import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
	constructor(private transactionsService: TransactionsService) {}

	@Get()
	getAllTransactions() {
		return this.transactionsService.getAllTransactions();
	}

	@Get(':id')
	getTransactionById(@Param('id') id: number) {
		return this.transactionsService.getTransactionById(id);
	}

	@Post()
	createTransaction(@Body() transactionDto: CreateTransactionDto) {
		return this.transactionsService.createTransaction(transactionDto);
	}

	@Put(':id')
	updateTransaction(
		@Body() transactionDto: UpdateTransactionDto,
		@Param('id') id: number
	) {
		return this.transactionsService.updateTransaction(transactionDto, id);
	}

	@Delete(':id')
	deleteTransaction(@Param('id') id: number) {
		return this.transactionsService.deleteTransaction(id);
	}
}
