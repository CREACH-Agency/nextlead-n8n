import { IDataObject } from 'n8n-workflow';

export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActionStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface ActionCreateRequest extends IDataObject {
	column: string;
	title?: string;
	assign_contact?: string;
	description?: string;
	dueDate?: string;
	priority?: ActionPriority;
	status?: ActionStatus;
}

export interface ActionUpdateRequest extends IDataObject {
	id?: string;
	title?: string;
	description?: string;
	dueDate?: string;
	priority?: ActionPriority;
	status?: ActionStatus;
	columnId?: string;
}

export interface ActionDeleteRequest extends IDataObject {
	contact_email: string;
}

export interface ActionResponse extends IDataObject {
	id: string;
	columnId: string;
	title: string;
	description?: string;
	dueDate?: string;
	priority: ActionPriority;
	status: ActionStatus;
	contactId?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ActionColumn extends IDataObject {
	id: string;
	name: string;
	order: number;
	color?: string;
	isDefault: boolean;
}
