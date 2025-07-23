import { IDataObject } from 'n8n-workflow';

// Enums utilisés par l'API
export type ContactCivility = 'M' | 'MME' | 'NEUTRAL';
export type ContactStatus =
	| 'ACTIVE'
	| 'INACTIVE'
	| 'TO_RECONTACT'
	| 'VIP'
	| 'UNEMPLOYED'
	| 'RETIRED'
	| 'TERMINATED'
	| 'DISBARRED'
	| 'DECEASED'
	| 'STUDENT'
	| 'RESIGNATION';

// Types pour les patterns spéciaux de l'API
export interface ContactSocial {
	type: string;
	url: string;
}

export interface ContactNextleadConfig {
	lead_score?: number;
	conversion_status?: string;
	assigned_to?: string; // user ID
	add_to_list?: string; // list ID
}

export interface ContactCustomFields {
	selected_field1?: string;
	value_1?: string;
	selected_field2?: string;
	value_2?: string;
	selected_field3?: string;
	value_3?: string;
	selected_field4?: string;
	value_4?: string;
	selected_field5?: string;
	value_5?: string;
}

export interface ContactBaseFields {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	mobile?: string;
	phonePro?: string;
	email2?: string;
	linkedin?: string;
	activity?: string;
	comment?: string;
	civility?: ContactCivility;
	status?: ContactStatus;
	birthDate?: string;
}

export interface ContactManagementFields {
	lists?: string[];
	users?: string[];
	socials?: ContactSocial[];
	nextlead_config?: ContactNextleadConfig[];
	custom_fields?: ContactCustomFields[];
	lead_score?: number;
	conversionStatusId?: string;
}

export interface ContactCreateRequest
	extends IDataObject,
		ContactBaseFields,
		ContactManagementFields {}

export interface ContactUpdateRequest
	extends IDataObject,
		Partial<ContactBaseFields>,
		ContactManagementFields {
	id: string;
}

export interface ContactSearchRequest extends IDataObject {
	email?: string;
	phone?: string;
	mobile?: string;
	linkedin?: string;
	firstName?: string;
	lastName?: string;
}

export interface ContactResponse extends IDataObject, ContactBaseFields {
	id: string;
	createdAt: string;
	updatedAt: string;
	customFields?: Record<string, any>;
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
