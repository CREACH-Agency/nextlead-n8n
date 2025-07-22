import { IDataObject } from 'n8n-workflow';

export interface SaleCreateRequest extends IDataObject {
	contactId: string;
	columnId: string;
	name: string;
	amount?: number;
	probability?: number;
	closeDate?: string;
	description?: string;
}

export interface SaleUpdateRequest extends IDataObject {
	id: string;
	name?: string;
	amount?: number;
	probability?: number;
	closeDate?: string;
	description?: string;
	columnId?: string;
}

export interface SaleDeleteRequest extends IDataObject {
	contact_email: string;
}

export interface SaleResponse extends IDataObject {
	id: string;
	contactId: string;
	columnId: string;
	name: string;
	amount: number;
	probability: number;
	closeDate?: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export interface SaleColumn extends IDataObject {
	id: string;
	name: string;
	order: number;
	color?: string;
	isDefault: boolean;
}
