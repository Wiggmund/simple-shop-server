import { Transaction } from '../entity/transaction.entity';

export type TransactionId = Pick<Transaction, 'id'>;

const temp: TransactionId = {
	id: 1
};
type key = keyof TransactionId;

export type TransactionIdType = typeof temp[key];
