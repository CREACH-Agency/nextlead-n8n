import { IDataObject } from 'n8n-workflow';

export type NextLeadCredentials = {
	domain: string;
	apiKey: string;
}

export type RequestConfig = {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	endpoint: string;
	data?: IDataObject;
	queryParams?: IDataObject;
}

export type NextLeadApiResponse = {
	success: boolean;
	data?: any;
	error?: string;
	message?: string;
}

export type ResourceOperation = {
	name: string;
	value: string;
	description: string;
	action: string;
}

export type ContactData = {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	linkedin?: string;
	job?: string;
	company?: string;
	city?: string;
	lists?: string;
	users?: string;
	customFieldValues?: any;
}

export type StructureData = {
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

export type SaleData = {
	contactId: string;
	columnId: string;
	name: string;
	amount?: number;
	probability?: number;
	closeDate?: string;
	description?: string;
}

export type ActionData = {
	contactId: string;
	columnId: string;
	title: string;
	description?: string;
	dueDate?: string;
	priority?: string;
	status?: string;
}

export type ResourceType = 'contact' | 'structure' | 'sale' | 'action' | 'list';
export type OperationType = 'create' | 'update' | 'delete' | 'get' | 'getAll' | 'getTeam' | 'getConversion' | 'getCustomFields' | 'getColumns';
