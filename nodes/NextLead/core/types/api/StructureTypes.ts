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
	email?: string;
	comment?: string;
}

export interface StructureCreateRequest extends IDataObject, StructureBaseFields {}

export interface StructureUpdateRequest extends IDataObject, Partial<StructureBaseFields> {
	id: string;
}

export interface StructureResponse extends IDataObject, StructureBaseFields {
	id: string;
	createdAt: string;
	updatedAt: string;
}
