import { IDataObject } from 'n8n-workflow';

export type TaskType = 'EMAIL' | 'CALL' | 'MEETING' | 'LUNCH' | 'LINKEDIN' | 'OTHER';

export interface ProjectBaseFields {
	title: string;
	note?: string;
}

export interface TaskBaseFields {
	taskType: TaskType;
	deadline?: string;
	note?: string;
}

export interface ProjectCreateRequest extends IDataObject, ProjectBaseFields {
	column: string;
	tasks?: TaskBaseFields[];
	assign_contact?: string;
}

export interface ProjectUpdateRequest extends IDataObject {
	id: string;
	title?: string;
	note?: string;
	columnId?: string;
}

export interface TaskCreateRequest extends IDataObject, TaskBaseFields {
	projectId: string;
}

export interface TaskUpdateRequest extends IDataObject {
	id: string;
	taskType?: TaskType;
	deadline?: string;
	note?: string;
	completed?: boolean;
}

export interface ProjectDeleteRequest extends IDataObject {
	contact_email: string;
}

export interface ProjectResponse extends IDataObject, ProjectBaseFields {
	id: string;
	columnId: string;
	contactId?: string;
	createdAt: string;
	updatedAt: string;
	tasks?: TaskResponse[];
}

export interface TaskResponse extends IDataObject, TaskBaseFields {
	id: string;
	projectId: string;
	completed: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectColumn extends IDataObject {
	id: string;
	name: string;
	order: number;
	color?: string;
	isDefault: boolean;
}
