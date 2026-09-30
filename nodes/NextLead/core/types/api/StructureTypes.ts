import { IDataObject } from 'n8n-workflow';

export type StructureType = 'ESTABLISHMENT';

export interface StructureBaseFields {
	name: string;
	siret?: string;
	address1?: string;
	city?: string;
	zipCode?: string;
	website?: string;
	phone?: string;
	phone2?: string;
	phone3?: string;
	email?: string;
	email2?: string;
	email3?: string;
	comment?: string;
	groupId?: string;
}

export interface StructureCreateRequest extends IDataObject, StructureBaseFields {}

/** Body of `structure/edit-structure`: at least one of id / siret / name. */
export interface StructureUpdateRequest extends IDataObject, Partial<StructureBaseFields> {
	id?: string;
	create_if_missing?: boolean;
}

export interface StructureResponse extends IDataObject, StructureBaseFields {
	id: string;
	createdAt: string;
	updatedAt: string;
}
