import { Role } from '../entity/role.entity';

export type RoleId = Pick<Role, 'id'>;

const temp: RoleId = {
	id: 1
};

type key = keyof RoleId;

export type RoleIdType = typeof temp[key];
