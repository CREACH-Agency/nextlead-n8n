import { IDataObject } from 'n8n-workflow';

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

export interface ContactSocial {
	type: string;
	url: string;
}

/**
 * CRM qualification keys shared by create and edit. The Zapier integration
 * exposes them as `contact_lead_source` / `contact_sector` / `contact_priority`
 * but sends them under these shorter API names.
 */
export interface ContactCrmConfig {
	/**
	 * Legacy single type. Since November 2026 it replaces *all* the contact's
	 * types with this one; `typeIds` is the multi-type form.
	 */
	contact_type?: string;
	lead_source?: string;
	sector?: string;
	priority?: string;
}

export interface ContactNextleadConfig extends ContactCrmConfig {
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
	phone2?: string;
	phone3?: string;
	email2?: string;
	linkedin?: string;
	activity?: string;
	comment?: string;
	civility?: ContactCivility;
	status?: ContactStatus;
	birthDate?: string;
	preferredLanguage?: string;
	email3?: string;
	image?: string;
	optInMarketing?: boolean;
	optInNewsletter?: boolean;
	optInSms?: boolean;
	optInPostal?: boolean;
	optOut?: boolean;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
}

/** Criteria accepted by `structure/get-single-structure`. */
export interface ContactStructureFindCriteria extends IDataObject {
	find_structure_id?: string;
	name?: string;
	siret?: string;
	email?: string;
	phone?: string;
}

/** Body of `contact/edit-contact`. At least one identifier is required. */
export interface ContactEditRequest extends IDataObject {
	contactId?: string;
	mail?: string;
	linkedin_find?: string;
	values_update: IDataObject[];
	/** Find or create: creates the contact when no identifier matches. */
	create_if_missing?: boolean;
}

/** Body of `contact/delete-contact`. At least one identifier is required. */
export interface ContactDeleteRequest extends IDataObject {
	contactId?: string;
	email?: string;
	linkedin?: string;
}

export interface ContactManagementFields {
	lists?: string[];
	users?: string[];
	socials?: ContactSocial[];
	nextlead_config?: ContactNextleadConfig[];
	custom_fields?: ContactCustomFields[];
	lead_score?: number;
	conversionStatusId?: string;
	/**
	 * CONTACT_TYPE tag IDs. Read at the body root by `new-contact` and inside
	 * `values_update` by `edit-contact`, where it replaces every type and `[]`
	 * clears them. Takes precedence over `contact_type`.
	 */
	typeIds?: string[];
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
	phone2?: string;
	linkedin?: string;
	firstName?: string;
	lastName?: string;
}

/** Tag reference (contact type, lead source, sector...). */
export interface ContactTagSummary extends IDataObject {
	id: string;
	name: string;
}

export interface ContactResponse extends IDataObject, ContactBaseFields {
	id: string;
	createdAt: string;
	updatedAt: string;
	customFields?: Record<string, unknown>;
	/** Every type of the contact (create, edit and the contact polling routes). */
	types?: ContactTagSummary[];
}

/** One custom field value, keyed by the field ID listed by `get-custom-fields`. */
export interface ContactCustomFieldValue extends IDataObject {
	id: string;
	value: string;
}

/**
 * Match returned by `contact/find-contact`, in snake_case. Only the fields the
 * node relies on or that the API added since 0.3 are spelled out.
 */
export interface ContactFindResult extends IDataObject {
	found?: boolean;
	id?: string;
	/** Legacy first type, kept next to the multi-type fields. */
	contact_type_id?: string | null;
	contact_type_ids?: string[];
	contact_types?: ContactTagSummary[];
	lead_source_id?: string | null;
	sector_id?: string | null;
	assigned_to_id?: string | null;
	created_by_id?: string | null;
	custom_fields?: ContactCustomFieldValue[];
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

/** Choice offered by a select-like custom field. */
export interface CustomFieldOption extends IDataObject {
	value: string;
	label: string;
}

/** Entry of `contact/get-custom-fields` and `structure/get-custom-fields`. */
export interface ContactCustomField extends IDataObject {
	id: string;
	name: string;
	type: string;
	code?: string | null;
	category?: string | null;
	/** Contact fields carry `teamId`, structure fields `groupId`. */
	teamId?: string;
	groupId?: string;
	groupName?: string;
	/** Allowed values, empty for free-form fields. */
	options?: CustomFieldOption[];
}

export interface ContactStructureLinkRequest {
	contactId?: string;
	email?: string;
	linkedin_url?: string;
	phone?: string;
	phone2?: string;
	customField?: {
		customFieldTypeId: string;
		value: string;
	};
	structureId?: string;
	siret?: string;
	structure_name?: string;
	structure_email?: string;
	structureCustomField?: {
		customFieldTypeId: string;
		value: string;
	};
}

export interface ContactStructureLinkResponse {
	message: string;
	contact: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		phone2: string;
		structures?: Array<{ id: string; name: string }>;
	};
	structure: {
		id: string;
		name: string;
		siret: string;
		email: string;
	};
	alreadyLinked: boolean;
}
