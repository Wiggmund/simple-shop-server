import { Attribute } from '../entity/attribute.entity';

export type AttributeId = Pick<Attribute, 'id'>;

const temp: AttributeId = {
	id: 1
};
type key = keyof AttributeId;

export type AttributeIdType = typeof temp[key];
