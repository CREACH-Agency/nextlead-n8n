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
}

export interface SalesDealCreateRequest extends IDataObject, SalesDealBaseFields {
	contact?: string; // email for contact assignment
	contactId?: string; // or direct ID
	column: string; // maps to stageId in API
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
}

export interface SalesDealDeleteRequest extends IDataObject {
	id: string;
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
