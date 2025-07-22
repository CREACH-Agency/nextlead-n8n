import { IDataObject } from 'n8n-workflow';

export interface StructureCreateRequest extends IDataObject {
	name: string;
	address?: string;
	city?: string;
	country?: string;
	email?: string;
	phone?: string;
	postalCode?: string;
	siret?: string;
	website?: string;
}

export interface StructureUpdateRequest extends IDataObject {
	id: string;
	name?: string;
	address?: string;
	city?: string;
	country?: string;
	email?: string;
	phone?: string;
	postalCode?: string;
	siret?: string;
	website?: string;
}

export interface StructureResponse extends IDataObject {
	id: string;
	name: string;
	address?: string;
	city?: string;
	country?: string;
	email?: string;
	phone?: string;
	postalCode?: string;
	siret?: string;
	website?: string;
	createdAt: string;
	updatedAt: string;
}
