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

/** Pipeline reference carried by pipeline-scoped tags and sales columns. */
export interface PipelineSummary {
	id: string;
	name: string;
	kind: string;
}

export interface ConversionStatus {
	id: string;
	name: string;
	type?: string;
	color?: string;
	icon?: string;
	order?: number;
	organizationId?: string;
	/** Pipeline the status belongs to, null for a status outside any pipeline. */
	pipeline?: PipelineSummary | null;
}

/** Tag of type IMPLANTATION_STATUS, from `structure/get-implantation-status`. */
export interface ImplantationStatus extends ConversionStatus {
	pipeline: PipelineSummary | null;
}

export type ResourceType =
	| 'contact'
	| 'structure'
	| 'sale'
	| 'action'
	| 'list'
	| 'group'
	| 'identify'
	| 'ai';

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
	| 'linkToContact'
	| 'run';

export interface ResourceOperation {
	name: string;
	value: string;
	description: string;
	action: string;
}
