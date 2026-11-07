import { IDataObject } from 'n8n-workflow';

import { PipelineSummary } from '../shared/ApiTypes';

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
	/** Kept excluding tax; `vatRate` is a percentage (0-100). */
	cost?: number;
	currency?: string;
	vatRate?: number;
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
	cost?: number;
	currency?: string;
	vatRate?: number;
	assignedToId?: string;
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
	/** Pipeline the column belongs to, null for a column outside any pipeline. */
	pipeline?: PipelineSummary | null;
}

export type SaleCompletionOutcome = 'won' | 'lost';

/** Query of `polling/sales/sale-won` and `sale-lost`. */
export interface SaleCompletionQuery {
	/** 1–200, the route defaults to 100. */
	limit?: number;
	/** ISO 8601: only closures at or after this instant. */
	since?: string;
	/** Opaque value read from the previous page's `X-Next-Cursor` header. */
	cursor?: string;
}

/**
 * One closure of a sale, as returned by the sale-won / sale-lost polling
 * routes. `id` is `<saleId>:<statusChangedAt ISO>`, unique per closure, so a
 * sale reopened then closed again yields a new event.
 */
export interface SaleCompletionEvent extends IDataObject {
	id: string;
	sale_id: string;
	name: string;
	status: 'WON' | 'LOST';
	statusChangedAt: string;
	closed_at: string;
	stageId: string | null;
	contactId: string | null;
	structureId: string | null;
	assignedToId: string | null;
	value: number | null;
	currency: string | null;
	closeDate: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SaleCompletionPage {
	/** Newest closure first. */
	events: SaleCompletionEvent[];
	/** Cursor of the next (older) page, null on the last one. */
	nextCursor: string | null;
}
