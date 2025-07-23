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

export type ContactCSP =
	| 'WORKER'
	| 'EMPLOYEE'
	| 'TECHNICIAN'
	| 'SUPERVISOR'
	| 'ENGINEER'
	| 'EXECUTIVE'
	| 'FARMER'
	| 'CRAFTSMAN'
	| 'TRADER'
	| 'COMPANY_MANAGER'
	| 'LIBERAL_PROFESSION'
	| 'INTERMEDIATE_PROFESSION'
	| 'TEACHER'
	| 'RETIRED'
	| 'UNEMPLOYED'
	| 'STUDENT'
	| 'OTHER';

export type ContactTrustLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

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
	csp?: ContactCSP;
	email2?: string;
	fax?: string;
	faxPro?: string;
	birthDate?: string;
	membershipDate?: string;
	trustLevel?: ContactTrustLevel;
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

export interface ContactSocial {
	type: string;
	url: string;
}

export interface ContactNextleadConfig {
	lead_score?: number;
	conversion_status?: string;
	assigned_to?: string;
	add_to_list?: string;
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

export interface ContactManagementFields {
	lists?: string[];
	users?: string[];
	customFieldValues?: Record<string, ContactCustomFieldValue>;
	custom_fields?: ContactCustomFields[];
	nextlead_config?: ContactNextleadConfig[];
	socials?: ContactSocial[];
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
	csp?: ContactCSP;
	email2?: string;
	fax?: string;
	faxPro?: string;
	birthDate?: string;
	membershipDate?: string;
	trustLevel?: ContactTrustLevel;
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
