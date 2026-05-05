import { IDataObject } from 'n8n-workflow';

export interface NextLeadApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	/** Original HTTP error (status code, body, headers) preserved for NodeApiError. */
	httpError?: unknown;
}

export interface NextLeadListResponse extends IDataObject {
	id: string;
	name: string;
	description?: string;
	contactCount?: number;
	createdAt: string;
	updatedAt: string;
}

export interface ConversionStatus {
	id: string;
	name: string;
	type?: string;
	color?: string;
	icon?: string;
	order?: number;
	organizationId?: string;
}

export type ResourceType =
	| 'contact'
	| 'structure'
	| 'sale'
	| 'action'
	| 'list'
	| 'group'
	| 'identify';

export type OperationType =
	| 'create'
	| 'update'
	| 'delete'
	| 'get'
	| 'getMany'
	| 'find'
	| 'getTeam'
	| 'getConversion'
	| 'getCustomFields'
	| 'getColumns'
	| 'user'
	| 'linkToStructure'
	| 'linkToContact';

export interface ResourceOperation {
	name: string;
	value: string;
	description: string;
	action: string;
}
