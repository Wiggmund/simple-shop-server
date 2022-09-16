import { RolesEnum } from './../../common/enums/roles.enum';
import { JwtRolesGuard } from './../../common/guards/jwt-role.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';
import { Roles } from '../../common/decorators/role.decorator';

@Roles(RolesEnum.Admin)
@UseGuards(JwtRolesGuard)
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
	createTransaction(
		@Body(DtoValidationPipe) transactionDto: CreateTransactionDto
	) {
		return this.transactionsService.createTransaction(transactionDto);
	}

	@Put(':id')
	updateTransaction(
		@Body(DtoValidationPipe) transactionDto: UpdateTransactionDto,
		@Param('id') id: number
	) {
		return this.transactionsService.updateTransaction(transactionDto, id);
	}

	@Delete(':id')
	deleteTransaction(@Param('id') id: number) {
		return this.transactionsService.deleteTransaction(id);
	}
}
