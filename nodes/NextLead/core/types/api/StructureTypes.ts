import { IDataObject } from 'n8n-workflow';

export type StructureType =
	| 'ESTABLISHMENT'
	| 'SYNDICATE'
	| 'PRIVATE_COMPANY'
	| 'PUBLIC_COMPANY'
	| 'ASSOCIATION'
	| 'FEDERATION'
	| 'PUBLIC_INSTITUTION';

export interface StructureBaseFields {
	name: string;
	address1?: string;
	address2?: string;
	address3?: string;
	city?: string;
	country?: string;
	email?: string;
	phone?: string;
	zipCode?: string;
	siret?: string;
	website?: string;
	type?: StructureType;
	numberEmployees?: number;
	marketArea?: string;
	companyType?: string;
	comment?: string;
}

export interface StructureCreateRequest extends IDataObject, StructureBaseFields {}

export interface StructureUpdateRequest extends IDataObject {
	id: string;
	name?: string;
	address1?: string;
	address2?: string;
	address3?: string;
	city?: string;
	country?: string;
	email?: string;
	phone?: string;
	zipCode?: string;
	siret?: string;
	website?: string;
	type?: StructureType;
	numberEmployees?: number;
	marketArea?: string;
	companyType?: string;
	comment?: string;
}

export interface StructureResponse extends IDataObject, StructureBaseFields {
	id: string;
	createdAt: string;
	updatedAt: string;
}
