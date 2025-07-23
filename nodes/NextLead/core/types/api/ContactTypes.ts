import { IDataObject } from 'n8n-workflow';

export type ContactCivility = 'M' | 'MME' | 'NEUTRAL';
export type ContactType =
	| 'CLIENT'
	| 'ADHERENT'
	| 'PROSPECT'
	| 'PARTNER'
	| 'SUPPLIER'
	| 'INVESTOR'
	| 'DECISION_MAKER'
	| 'INFLUENCER'
	| 'FINAL_USER'
	| 'GOVERNMENT_REPRESENTATIVE'
	| 'CANDIDATE'
	| 'JOURNALIST'
	| 'MENTOR';

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

export type ContactPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type ContactPreferredCommunication = 'EMAIL' | 'PHONE' | 'SMS' | 'SOCIAL';
export type ContactPreferredTimeToContact = 'MORNING' | 'AFTERNOON' | 'END_DAY';

export type ContactCustomFieldValue = string | number | boolean | Date | null;
export type ContactCustomFieldType = 'text' | 'number' | 'boolean' | 'date' | 'select';

export interface ContactBaseFields {
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
	activity?: string;
	sector?: string;
	csp?: string;
	organizationId?: string;
	civility?: ContactCivility;
	type?: ContactType;
	status?: ContactStatus;
	priority?: ContactPriority;
	membership?: boolean;
	optInMarketing?: boolean;
	optInNewsletter?: boolean;
	optInSms?: boolean;
	preferredLanguage?: string;
	preferredCommunication?: ContactPreferredCommunication;
	preferredTimeToContact?: ContactPreferredTimeToContact;
}

export interface ContactManagementFields {
	lists?: string[];
	users?: string[];
	customFieldValues?: Record<string, ContactCustomFieldValue>;
	lead_score?: number;
	callRetry?: number;
	lastCallOutcome?: string;
	conversionStatusId?: string;
	comment?: string;
}

export interface ContactCreateRequest
	extends IDataObject,
		ContactBaseFields,
		ContactManagementFields {}

export interface ContactUpdateRequest extends IDataObject, ContactManagementFields {
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
	activity?: string;
	sector?: string;
	csp?: string;
	organizationId?: string;
	civility?: ContactCivility;
	type?: ContactType;
	status?: ContactStatus;
	priority?: ContactPriority;
	membership?: boolean;
	optInMarketing?: boolean;
	optInNewsletter?: boolean;
	optInSms?: boolean;
	preferredLanguage?: string;
	preferredCommunication?: ContactPreferredCommunication;
	preferredTimeToContact?: ContactPreferredTimeToContact;
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
	type: ContactCustomFieldType;
	required: boolean;
	options?: string[];
}
