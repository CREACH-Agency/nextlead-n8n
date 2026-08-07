import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils, IFieldConfig } from '../../utils/FieldDefinitionUtils';

/**
 * Criteria used to resolve an existing structure before the contact is sent, the
 * same lookup the Zapier integration performs. Kept in one place so create and
 * update expose an identical surface.
 *
 * The ID criterion is separate: create resolves an explicit ID through the
 * structure picker in Organization Settings, so offering it here too would be a
 * second way to say the same thing. Update has no picker and needs it.
 */
const structureFindFields: IFieldConfig[] = [
	{
		name: 'siret',
		displayName: 'SIRET',
		description: 'SIRET number of the structure to look up',
	},
	{
		name: 'email',
		displayName: 'Structure Email',
		description: 'Email address of the structure to look up',
	},
	{
		name: 'name',
		displayName: 'Structure Name',
		description: 'Name of the structure to look up. Matched exactly, ignoring case.',
	},
	{
		name: 'phone',
		displayName: 'Structure Phone',
		description: 'Phone number of the structure to look up',
	},
];

/** Sent to the lookup route as `id`; named after Zapier's own input field. */
const structureFindIdField: IFieldConfig = {
	displayName: 'Structure ID',
	name: 'find_structure_id',
	description: 'ID of the structure to link (most reliable criterion)',
};

/**
 * Governs how an *existing* structure is attached. It sits next to the lookup
 * criteria rather than in the creation group, because that is where the user
 * decides to attach a structure that already exists — the creation group keeps
 * its own toggle for the structure it creates.
 */
const setAsMainStructureField: IFieldConfig = {
	displayName: 'Set as Main Structure',
	name: 'setAsMainStructure',
	description:
		"Whether to set this structure as the contact's main structure. If disabled, the structure is only added as a secondary link.",
	type: 'boolean',
	default: true,
};

/**
 * CRM qualification fields, sent under the short API names. Contact type, lead
 * source and sector are organization tags, so they are loaded from NextLead
 * rather than typed by hand; priority is a fixed enum.
 */
const crmConfigFields: IFieldConfig[] = [
	{
		displayName: 'Contact Type Name or ID',
		name: 'contact_type',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		type: 'options',
		default: '',
		typeOptions: { loadOptionsMethod: 'getContactTypes' },
	},
	{
		displayName: 'Lead Source Name or ID',
		name: 'lead_source',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		type: 'options',
		default: '',
		typeOptions: { loadOptionsMethod: 'getLeadSources' },
	},
	{
		displayName: 'Priority',
		name: 'priority',
		description: 'Priority level assigned to the contact in NextLead',
		type: 'options',
		default: '',
		options: [
			{ name: '- None -', value: '' },
			{ name: 'High', value: 'HIGH' },
			{ name: 'Low', value: 'LOW' },
			{ name: 'Normal', value: 'NORMAL' },
		],
	},
	{
		displayName: 'Sector Name or ID',
		name: 'sector',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		type: 'options',
		default: '',
		typeOptions: { loadOptionsMethod: 'getSectors' },
	},
];

/**
 * Conversion status is defined once and reused: it belongs to the same
 * qualification group as the CRM fields but lives in `nextlead_config` too.
 */
const conversionStatusField: IFieldConfig = {
	displayName: 'Conversion Status Name or ID',
	name: 'conversion_status',
	description:
		'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	type: 'options',
	default: '',
	typeOptions: { loadOptionsMethod: 'getConversionStatuses' },
};

/** The three values NextLead accepts for civility; NEUTRAL is its default. */
const civilityField: IFieldConfig = {
	displayName: 'Civility',
	name: 'civility',
	description: 'Form of address for the contact',
	type: 'options',
	default: 'NEUTRAL',
	options: [
		{ name: 'M', value: 'M' },
		{ name: 'MME', value: 'MME' },
		{ name: 'NEUTRAL', value: 'NEUTRAL' },
	],
};

/**
 * `createCollectionField` normalises an `IFieldConfig` into an `INodeProperties`
 * for collections; a fixedCollection's `values` needs the same treatment, so the
 * shared definitions above can be reused verbatim in both.
 */
function toNodeProperty(field: IFieldConfig): INodeProperties {
	return {
		displayName: field.displayName,
		name: field.name,
		type: field.type ?? 'string',
		default: field.default ?? '',
		description: field.description,
		...(field.options && { options: field.options }),
		...(field.typeOptions && { typeOptions: field.typeOptions }),
		...(field.placeholder && { placeholder: field.placeholder }),
	} as INodeProperties;
}

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['contact'] },
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new contact',
				action: 'Create a contact',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a contact',
				action: 'Delete a contact',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find a contact by email or LinkedIn',
				action: 'Find a contact',
			},
			{
				name: 'Get Conversion',
				value: 'getConversion',
				description: 'Get conversion statuses',
				action: 'Get conversion statuses',
			},
			{ name: 'Get Custom Fields', value: 'getCustomFields', action: 'Get custom fields' },
			{
				name: 'Get Team',
				value: 'getTeam',
				description: 'Get team members',
				action: 'Get team members',
			},
			{
				name: 'Link to Structure',
				value: 'linkToStructure',
				description: 'Link a contact to a structure',
				action: 'Link a contact to a structure',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a contact',
				action: 'Update a contact',
			},
		],
		default: 'create',
	},
];

const createFields = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string' as const,
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'name@email.com',
		description: 'Email address of the contact',
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string' as const,
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'First name of the contact',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string' as const,
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Last name of the contact',
	},
	FieldDefinitionUtils.createCollectionField({
		name: 'contactFields',
		displayName: 'Additional Contact Information',
		description: 'Additional contact information',
		operations: ['create'],
		fields: [
			{ name: 'phone', displayName: 'Phone', description: 'Phone number of the contact' },
			{
				name: 'activity',
				displayName: 'Job/Activity',
				description: 'Job or activity of the contact',
			},
			civilityField,
			{
				name: 'mobile',
				displayName: 'Secondary Phone',
				description: 'Second phone number of the contact (mobile slot in NextLead)',
			},
			{
				name: 'phonePro',
				displayName: 'Third Phone',
				description: 'Third phone number of the contact (professional slot in NextLead)',
			},
			{
				name: 'comment',
				displayName: 'Comment',
				description: 'Additional comments about the contact',
			},
			{
				name: 'email2',
				displayName: 'Secondary Email',
				description: 'Additional email address of the contact',
				placeholder: 'name@email.com',
			},
			{
				name: 'preferredLanguage',
				displayName: 'Preferred Language',
				description: 'Preferred language of the contact, as a locale code such as fr or en',
			},
		],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'organizationFields',
		displayName: 'Organization Settings',
		description: 'Organization-related settings',
		operations: ['create'],
		fields: [
			{
				name: 'conversionStatusId',
				displayName: 'Conversion Status ID',
				description: 'ID of the conversion status (from Get Conversion operation)',
			},
			{
				displayName: 'Structure Name or ID',
				name: 'establishmentId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a structure...',
						typeOptions: {
							searchListMethod: 'searchStructures',
							searchable: true,
							searchFilterRequired: false,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'structure-id',
					},
				],
				description: 'Choose from the structure list using search, or specify an ID directly',
			},
			{
				name: 'listId',
				displayName: 'List ID',
				description: 'ID of the list to add the contact to',
			},
		],
	}),
	{
		displayName: 'Social Networks',
		name: 'socials',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		description: 'Social network profiles',
		typeOptions: { multipleValues: false },
		options: [
			{
				name: 'social',
				displayName: 'Social',
				values: [
					{
						displayName: 'LinkedIn',
						name: 'linkedin',
						type: 'string' as const,
						default: '',
						description: 'LinkedIn profile URL',
						placeholder: 'https://linkedin.com/in/profile',
					},
					{
						displayName: 'Facebook',
						name: 'facebook',
						type: 'string' as const,
						default: '',
						description: 'Facebook profile URL',
						placeholder: 'https://facebook.com/profile',
					},
					{
						displayName: 'Instagram',
						name: 'instagram',
						type: 'string' as const,
						default: '',
						description: 'Instagram handle',
						placeholder: '@profile',
					},
				],
			},
		],
	},
	{
		displayName: 'NextLead Config',
		name: 'nextlead_config',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		description: 'NextLead configuration options',
		typeOptions: { multipleValues: false },
		options: [
			{
				name: 'config',
				displayName: 'Config',
				values: [
					{
						displayName: 'Add to List Name or ID',
						name: 'add_to_list',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getLists' },
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Assigned To Name or ID',
						name: 'assigned_to',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getTeamMembers' },
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					toNodeProperty(conversionStatusField),
					{
						displayName: 'Lead Score',
						name: 'lead_score',
						type: 'number' as const,
						default: 0,
						description: 'Lead score (0-100)',
						typeOptions: { minValue: 0, maxValue: 100 },
					},
					...crmConfigFields.map(toNodeProperty),
				],
			},
		],
	},
	FieldDefinitionUtils.createCollectionField({
		name: 'findStructure',
		displayName: 'Find Structure',
		description:
			'Look up an existing structure and link it to the contact. Used only when no structure is selected in Organization Settings; when nothing matches, the Create & Link Structure fields are used instead. Criteria matching several structures fail the node rather than picking one. Set as Main Structure applies to any existing structure, including one picked in Organization Settings.',
		placeholder: 'Add Criterion',
		operations: ['create'],
		fields: [...structureFindFields, setAsMainStructureField],
	}),
	{
		displayName: 'Custom Fields',
		name: 'custom_fields',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		description: 'Custom field values',
		typeOptions: { multipleValues: true },
		options: [
			{
				name: 'customField',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'selected_field',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getCustomFieldTypes' },
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string' as const,
						default: '',
						description: 'Value for the custom field',
					},
				],
			},
		],
	},
	{
		displayName: 'Note',
		name: 'note',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		description: 'Add a note to the contact upon creation',
		typeOptions: { multipleValues: false },
		options: [
			{
				name: 'noteData',
				displayName: 'Note',
				values: [
					{
						displayName: 'Content',
						name: 'note_content',
						type: 'string' as const,
						typeOptions: { rows: 4 },
						default: '',
						description: 'Text content of the note',
					},
					{
						displayName: 'Title',
						name: 'note_title',
						type: 'string' as const,
						default: '',
						description: 'Optional title for the note',
					},
					{
						displayName: 'Author User Name or ID',
						name: 'note_author_user_id',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getTeamMembers' },
						default: '',
						description:
							'User who authored the note. Defaults to the assigned user if not specified. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
				],
			},
		],
	},
	{
		displayName: 'Create & Link Structure',
		name: 'newStructure',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		description:
			'Optionally create a new structure together with this contact and link them. Used only when no structure was selected in Organization Settings and no Find Structure criterion matched. The structure is created first, then the contact is created already linked to it.',
		typeOptions: { multipleValues: false },
		options: [
			{
				name: 'structure',
				displayName: 'Structure',
				values: [
					{
						displayName: 'Address',
						name: 'address1',
						type: 'string' as const,
						default: '',
						description: 'Street address of the structure',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string' as const,
						default: '',
						description: 'City of the structure',
					},
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string' as const,
						default: '',
						description: 'Comment about the structure',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string' as const,
						default: '',
						description: 'Email address of the structure',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string' as const,
						default: '',
						description:
							'Name of the structure to create. Creation is triggered as soon as a name, a SIRET or an email is filled in.',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string' as const,
						default: '',
						description: 'Phone number of the structure',
					},
					{
						displayName: 'Set as Main Structure',
						name: 'setAsMainStructure',
						type: 'boolean' as const,
						default: true,
						description:
							"Whether to set the newly created structure as the contact's main structure. If disabled, it will be linked as a secondary structure.",
					},
					{
						displayName: 'SIRET',
						name: 'siret',
						type: 'string' as const,
						default: '',
						description: 'SIRET number of the structure',
					},
					{
						displayName: 'Website',
						name: 'website',
						type: 'string' as const,
						default: '',
						description: 'Website URL of the structure',
						placeholder: 'https://www.example.com',
					},
					{
						displayName: 'Zip Code',
						name: 'zipCode',
						type: 'string' as const,
						default: '',
						description: 'Postal code of the structure',
					},
				],
			},
		],
	},
];

const updateFields = [
	FieldDefinitionUtils.createStringField({
		name: 'contactId',
		displayName: 'Contact ID',
		description: 'ID of the contact to update (most reliable identifier)',
		required: false,
		operations: ['update'],
	}),
	FieldDefinitionUtils.createEmailField({
		name: 'email',
		displayName: 'Email',
		description: 'Email address of the contact to update',
		required: false,
		operations: ['update'],
	}),
	FieldDefinitionUtils.createStringField({
		name: 'linkedinFind',
		displayName: 'LinkedIn URL',
		description: 'LinkedIn profile URL to find the contact (alternative to email)',
		required: false,
		operations: ['update'],
		placeholder: 'https://linkedin.com/in/profile',
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'updateFields',
		displayName: 'Update Fields',
		description:
			'Fields to update. Only the fields added here are sent, so an untouched field keeps its current value.',
		operations: ['update'],
		fields: [
			{ name: 'firstName', displayName: 'First Name', description: 'First name of the contact' },
			{ name: 'lastName', displayName: 'Last Name', description: 'Last name of the contact' },
			{ name: 'email', displayName: 'Email', description: 'Email address of the contact' },
			...FieldDefinitionUtils.getCommonContactFields(),
			{
				name: 'email2',
				displayName: 'Secondary Email',
				description: 'Additional email address of the contact',
				placeholder: 'name@email.com',
			},
			{
				name: 'mobile',
				displayName: 'Secondary Phone',
				description: 'Second phone number of the contact (mobile slot in NextLead)',
			},
			{
				name: 'phonePro',
				displayName: 'Third Phone',
				description: 'Third phone number of the contact (professional slot in NextLead)',
			},
			{
				name: 'activity',
				displayName: 'Job/Activity',
				description: 'Job or activity of the contact',
			},
			civilityField,
			{
				name: 'comment',
				displayName: 'Comment',
				description: 'Additional comments about the contact',
			},
			{ name: 'facebook', displayName: 'Facebook', description: 'Facebook profile URL' },
			{ name: 'instagram', displayName: 'Instagram', description: 'Instagram handle' },
			{
				displayName: 'Add to List Name or ID',
				name: 'add_to_list',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getLists' },
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Assigned To Name or ID',
				name: 'assigned_to',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getTeamMembers' },
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			conversionStatusField,
			{
				displayName: 'Lead Score',
				name: 'lead_score',
				description: 'Lead score (0-100)',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, maxValue: 100 },
			},
			...crmConfigFields,
		],
	}),
	{
		displayName: 'Custom Fields',
		name: 'customFieldsUpdate',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
		description: 'Custom field values to update',
		typeOptions: { multipleValues: true },
		options: [
			{
				name: 'customField',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'selected_field',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getCustomFieldTypes' },
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string' as const,
						default: '',
						description: 'Value for the custom field',
					},
				],
			},
		],
	},
	{
		displayName: 'Note',
		name: 'noteUpdate',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
		description: 'Add a note to the contact upon update',
		typeOptions: { multipleValues: false },
		options: [
			{
				name: 'noteData',
				displayName: 'Note',
				values: [
					{
						displayName: 'Content',
						name: 'note_content',
						type: 'string' as const,
						typeOptions: { rows: 4 },
						default: '',
						description: 'Text content of the note',
					},
					{
						displayName: 'Title',
						name: 'note_title',
						type: 'string' as const,
						default: '',
						description: 'Optional title for the note',
					},
					{
						displayName: 'Author User Name or ID',
						name: 'note_author_user_id',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getTeamMembers' },
						default: '',
						description:
							'User who authored the note. Defaults to the assigned user if not specified. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
				],
			},
		],
	},
	FieldDefinitionUtils.createCollectionField({
		name: 'findStructureUpdate',
		displayName: 'Find Structure',
		description:
			'Optionally link an existing structure to this contact by describing it. The structure is resolved at execution time, so the criteria can come from the incoming item. Criteria matching several structures fail the node rather than picking one.',
		placeholder: 'Add Criterion',
		operations: ['update'],
		fields: [
			// The update operation has no structure picker, so the ID has to be
			// reachable as a criterion of its own.
			structureFindIdField,
			...structureFindFields,
			setAsMainStructureField,
		],
	}),
];

const deleteFields = [
	FieldDefinitionUtils.createStringField({
		name: 'contactId',
		displayName: 'Contact ID',
		description: 'ID of the contact to delete (most reliable identifier)',
		required: false,
		operations: ['delete'],
	}),
	FieldDefinitionUtils.createEmailField({
		name: 'email',
		displayName: 'Email',
		description: 'Email address of the contact to delete',
		required: false,
		operations: ['delete'],
	}),
	FieldDefinitionUtils.createStringField({
		name: 'linkedin',
		displayName: 'LinkedIn URL',
		description: 'LinkedIn profile URL (alternative to email)',
		required: false,
		operations: ['delete'],
		placeholder: 'https://linkedin.com/in/profile',
	}),
];

const findFields = [
	FieldDefinitionUtils.createEmailField({
		name: 'email',
		displayName: 'Email',
		description: 'Email address of the contact to find',
		required: false,
		operations: ['find'],
	}),
	FieldDefinitionUtils.createStringField({
		name: 'linkedinUrl',
		displayName: 'LinkedIn URL',
		description: 'LinkedIn profile URL to find the contact',
		required: false,
		operations: ['find'],
		placeholder: 'https://linkedin.com/in/profile',
	}),
];

const linkToStructureFields = [
	FieldDefinitionUtils.createCollectionField({
		name: 'contactIdentifiers',
		displayName: 'Contact Identifiers',
		description:
			'Choose at least one identifier to find the contact. Contact ID is the most reliable method.',
		placeholder: 'Add Identifier',
		operations: ['linkToStructure'],
		fields: [
			{
				name: 'contactId',
				displayName: 'Contact ID',
				description: 'Contact ID (most reliable identifier)',
			},
			{
				name: 'email',
				displayName: 'Email',
				description: 'Email address',
			},
			{
				name: 'linkedin_url',
				displayName: 'LinkedIn URL',
				description: 'LinkedIn profile URL',
			},
			{
				name: 'phone',
				displayName: 'Phone',
				description: 'Phone number',
			},
			{
				name: 'mobile',
				displayName: 'Secondary Phone',
				description: 'Second phone number of the contact (mobile slot in NextLead)',
			},
		],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'contactCustomField',
		displayName: 'Contact Custom Field Identifier',
		description: 'Use a custom field to identify the contact',
		placeholder: 'Add Custom Field Identifier',
		operations: ['linkToStructure'],
		fields: [
			{
				name: 'customFieldTypeId',
				displayName: 'Custom Field Type ID',
				description: 'ID of the custom field type',
			},
			{
				name: 'value',
				displayName: 'Value',
				description: 'Value of the custom field',
			},
		],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'structureIdentifiers',
		displayName: 'Structure Identifiers',
		description:
			'Choose at least one identifier to find the structure. Structure ID or SIRET is most reliable.',
		placeholder: 'Add Identifier',
		operations: ['linkToStructure'],
		fields: [
			{
				name: 'structureId',
				displayName: 'Structure ID',
				description: 'Structure ID (most reliable identifier)',
			},
			{
				name: 'siret',
				displayName: 'SIRET',
				description: 'SIRET number (most reliable identifier)',
			},
			{
				name: 'structure_name',
				displayName: 'Structure Name',
				description: 'Name of the structure',
			},
			{
				name: 'structure_email',
				displayName: 'Structure Email',
				description: 'Email address of the structure',
			},
		],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'structureCustomField',
		displayName: 'Structure Custom Field Identifier',
		description: 'Use a custom field to identify the structure',
		placeholder: 'Add Custom Field Identifier',
		operations: ['linkToStructure'],
		fields: [
			{
				name: 'customFieldTypeId',
				displayName: 'Custom Field Type ID',
				description: 'ID of the custom field type',
			},
			{
				name: 'value',
				displayName: 'Value',
				description: 'Value of the custom field',
			},
		],
	}),
	{
		displayName: 'Set as Main Structure',
		name: 'setAsMainStructure',
		type: 'boolean' as const,
		default: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['linkToStructure'],
			},
		},
		description:
			"Whether to set this structure as the contact's main structure. If disabled, the structure is only added as a secondary link.",
	},
];

// `ResourceManager.getAllFields` stamps `displayOptions.show.resource` on every
// property it collects, so a property defined here without one is still scoped
// to the contact resource by the time it reaches the node description.
export const contactFields: INodeProperties[] = [
	...createFields,
	...updateFields,
	...deleteFields,
	...findFields,
	...linkToStructureFields,
];
