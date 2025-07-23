import { IDataObject } from 'n8n-workflow';

export type SalesDealPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type SalesDealStatus = 'ACTIVE' | 'WON' | 'LOST' | 'PAUSED' | 'LONG_TERM_PAUSED' | 'PENDING';
export type SalesDealType = 'NEW_CLIENT' | 'RENEWAL' | 'UPSELL' | 'CROSS_SELL';

export interface SalesDealBaseFields {
	name: string;
	value?: number;
	successRate?: number;
	closeDate?: string;
	description?: string;
	priority?: SalesDealPriority;
	type?: SalesDealType;
	status?: SalesDealStatus;
}

export interface SalesDealCreateRequest extends IDataObject, SalesDealBaseFields {
	contactId: string;
	stageId: string;
}

export interface SalesDealUpdateRequest extends IDataObject {
	id: string;
	name?: string;
	value?: number;
	successRate?: number;
	closeDate?: string;
	description?: string;
	stageId?: string;
	priority?: SalesDealPriority;
	type?: SalesDealType;
	status?: SalesDealStatus;
}

export interface SalesDealDeleteRequest extends IDataObject {
	contact_email: string;
}

export interface SalesDealResponse extends IDataObject, SalesDealBaseFields {
	id: string;
	contactId: string;
	stageId: string;
	createdAt: string;
	updatedAt: string;
}

export interface SalesDealStage extends IDataObject {
	id: string;
	name: string;
	order: number;
	color?: string;
	isDefault: boolean;
}
