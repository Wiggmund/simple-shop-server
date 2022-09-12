import { Transaction } from '../entity/transaction.entity';

export type TransactionId = Pick<Transaction, 'id'>;
