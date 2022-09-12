import { EntityManager, QueryRunner, Repository } from 'typeorm';

export interface TransactionKit<E> {
	queryRunner: QueryRunner;
	repository: Repository<E>;
	manager: EntityManager;
}
