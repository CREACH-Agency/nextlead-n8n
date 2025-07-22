import { IDataObject } from 'n8n-workflow';

export type ContactCustomFieldValue = string | number | boolean | Date | null;

export interface ContactCreateRequest extends IDataObject {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	mobile?: string;
	phonePro?: string;
	linkedin?: string;
	job?: string;
	company?: string;
	city?: string;
	address?: string;
	zipCode?: string;
	country?: string;
	civility?: 'M' | 'Mme' | 'Mlle' | 'Dr' | 'Pr' | 'Me';
	type?: 'PHYSIQUE' | 'MORALE';
	status?: 'ACTIF' | 'INACTIF' | 'ARCHIVE';
	membership?: boolean;
	optInMarketing?: boolean;
	optInNewsletter?: boolean;
	optInSms?: boolean;
	lists?: string[];
	users?: string[];
	customFieldValues?: Record<string, ContactCustomFieldValue>;
}

export interface ContactUpdateRequest extends IDataObject {
	id: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	mobile?: string;
	phonePro?: string;
	linkedin?: string;
	job?: string;
	company?: string;
	city?: string;
	address?: string;
	zipCode?: string;
	country?: string;
	civility?: 'M' | 'Mme' | 'Mlle' | 'Dr' | 'Pr' | 'Me';
	type?: 'PHYSIQUE' | 'MORALE';
	status?: 'ACTIF' | 'INACTIF' | 'ARCHIVE';
	membership?: boolean;
	optInMarketing?: boolean;
	optInNewsletter?: boolean;
	optInSms?: boolean;
	lists?: string[];
	users?: string[];
	customFieldValues?: Record<string, ContactCustomFieldValue>;
}

export interface ContactSearchRequest extends IDataObject {
	email?: string;
	phone?: string;
	mobile?: string;
	linkedin?: string;
	firstName?: string;
	lastName?: string;
}

export interface ContactResponse extends IDataObject {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	mobile?: string;
	phonePro?: string;
	linkedin?: string;
	job?: string;
	company?: string;
	city?: string;
	address?: string;
	zipCode?: string;
	country?: string;
	civility?: 'M' | 'Mme' | 'Mlle' | 'Dr' | 'Pr' | 'Me';
	type?: 'PHYSIQUE' | 'MORALE';
	status?: 'ACTIF' | 'INACTIF' | 'ARCHIVE';
	membership?: boolean;
	optInMarketing?: boolean;
	optInNewsletter?: boolean;
	optInSms?: boolean;
	createdAt: string;
	updatedAt: string;
	customFields?: Record<string, ContactCustomFieldValue>;
}

export interface ContactTeamMember extends IDataObject {
	id: string;
	email: string;
	name: string;
	role?: string;
}

export interface ContactConversionData extends IDataObject {
	total: number;
	converted: number;
	rate: number;
	period: string;
}

export interface ContactCustomField extends IDataObject {
	id: string;
	name: string;
	type: 'text' | 'number' | 'boolean' | 'date' | 'select';
	required: boolean;
	options?: string[];
}
