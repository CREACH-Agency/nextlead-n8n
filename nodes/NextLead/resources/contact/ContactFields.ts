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
				name: 'Get Team',
				value: 'getTeam',
				description: 'Get team members',
				action: 'Get team members',
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
	FieldDefinitionUtils.createEmailField({
		name: 'email',
		displayName: 'Email',
		description: 'Email address of the contact',
		required: true,
		operations: ['create'],
	}),
	{
		displayName: 'Civility',
		name: 'civility',
		type: 'options' as const,
		required: true,
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		options: [
			{ name: 'M.', value: 'M' },
			{ name: 'Mme', value: 'MME' },
			{ name: 'Neutre', value: 'NEUTRAL' },
		],
		default: 'M',
		description: 'Civility of the contact',
	},
	FieldDefinitionUtils.createStringField({
		name: 'firstName',
		displayName: 'First Name',
		description: 'First name of the contact',
		required: false,
		operations: ['create'],
	}),
	FieldDefinitionUtils.createStringField({
		name: 'lastName',
		displayName: 'Last Name',
		description: 'Last name of the contact',
		required: false,
		operations: ['create'],
	}),
	{
		displayName: 'Conversion Status Name or ID',
		name: 'conversionStatusId',
		type: 'options' as const,
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		typeOptions: { loadOptionsMethod: 'getConversionStatuses' },
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	FieldDefinitionUtils.createStringField({
		name: 'activity',
		displayName: 'Job/Activity',
		description: 'Job or activity of the contact',
		required: false,
		operations: ['create'],
	}),
	FieldDefinitionUtils.createStringField({
		name: 'phone',
		displayName: 'Phone',
		description: 'Phone number of the contact',
		required: false,
		operations: ['create'],
	}),
	{
		displayName: 'Establishment Name or ID',
		name: 'establishmentId',
		type: 'options' as const,
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		typeOptions: { loadOptionsMethod: 'getEstablishments' },
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'List Name or ID',
		name: 'listId',
		type: 'options' as const,
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		typeOptions: { loadOptionsMethod: 'getLists' },
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	FieldDefinitionUtils.createCollectionField({
		name: 'additionalFields',
		displayName: 'Additional Fields',
		description: 'Additional fields for the contact',
		operations: ['create'],
		fields: [
			...FieldDefinitionUtils.getCommonContactFields(),
			{ displayName: 'Mobile', name: 'mobile', description: 'Mobile phone number' },
			{ displayName: 'Phone Pro', name: 'phonePro', description: 'Professional phone number' },
			{
				displayName: 'Comment',
				name: 'comment',
				description: 'Additional comments about the contact',
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
						displayName: 'Lead Score',
						name: 'lead_score',
						type: 'number' as const,
						default: 0,
						description: 'Lead score (0-100)',
						typeOptions: { minValue: 0, maxValue: 100 },
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
						displayName: 'Assigned To Name or ID',
						name: 'assigned_to',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getTeamMembers' },
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Add to List Name or ID',
						name: 'add_to_list',
						type: 'options' as const,
						typeOptions: { loadOptionsMethod: 'getLists' },
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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

export const contactFields: INodeProperties[] = [
	...createFields,
	...updateFields,
	...deleteFields,
	...findFields,
];
