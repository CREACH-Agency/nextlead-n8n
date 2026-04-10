import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils } from '../../utils/FieldDefinitionUtils';

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
				name: 'Get Limit Status',
				value: 'getLimitStatus',
				description: 'Check contact limit and usage',
				action: 'Get contact limit status',
			},
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
			{
				name: 'civility',
				displayName: 'Civility',
				description: 'Civility of the contact (M, MME, or NEUTRAL - default: NEUTRAL)',
			},
			{ name: 'mobile', displayName: 'Mobile', description: 'Mobile phone number' },
			{ name: 'phonePro', displayName: 'Phone Pro', description: 'Professional phone number' },
			{
				name: 'comment',
				displayName: 'Comment',
				description: 'Additional comments about the contact',
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
				description:
					'Choose from the structure list using search, or specify an ID directly',
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
					{
						displayName: 'Conversion Status Name or ID',
						name: 'conversion_status',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getConversionStatuses' },
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Lead Score',
						name: 'lead_score',
						type: 'number' as const,
						default: 0,
						description: 'Lead score (0-100)',
						typeOptions: { minValue: 0, maxValue: 100 },
					},
				],
			},
		],
	},
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
		displayName: 'Create & Link Structure',
		name: 'newStructure',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		description:
			'Optionally create a new structure together with this contact and link them. The structure is created first, then linked to the newly created contact.',
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
						description: 'Name of the structure to create (required to enable structure creation)',
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
							'Whether to set the newly created structure as the contact\'s main structure. If disabled, it will be linked as a secondary structure.',
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
		description: 'Fields to update',
		operations: ['update'],
		fields: [
			{ name: 'firstName', displayName: 'First Name', description: 'First name of the contact' },
			{ name: 'lastName', displayName: 'Last Name', description: 'Last name of the contact' },
			{ name: 'email', displayName: 'Email', description: 'Email address of the contact' },
			...FieldDefinitionUtils.getCommonContactFields(),
		],
	}),
	{
		displayName: 'Link Structure',
		name: 'linkStructure',
		type: 'fixedCollection' as const,
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
		description: 'Optionally link an existing structure to this contact',
		typeOptions: { multipleValues: false },
		options: [
			{
				name: 'structure',
				displayName: 'Structure',
				values: [
					{
						displayName: 'Structure Name or ID',
						name: 'structureId',
						type: 'resourceLocator' as const,
						required: true,
						default: { mode: 'list', value: '' },
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list' as const,
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
								type: 'string' as const,
								placeholder: 'structure-id',
							},
						],
						description:
							'Choose from the structure list using search, or specify an ID directly',
					},
					{
						displayName: 'Set as Main Structure',
						name: 'setAsMainStructure',
						type: 'boolean' as const,
						default: true,
						description:
							'Whether to set this structure as the contact\'s main structure. If disabled, the structure is only added as a secondary link.',
					},
				],
			},
		],
	},
];

const deleteFields = [
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
				displayName: 'Mobile',
				description: 'Mobile number',
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
			'Whether to set this structure as the contact\'s main structure. If disabled, the structure is only added as a secondary link.',
	},
];

export const contactFields: INodeProperties[] = [
	...createFields,
	...updateFields,
	...deleteFields,
	...findFields,
	...linkToStructureFields,
];
