import { INodeProperties } from 'n8n-workflow';

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contact'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new contact',
				action: 'Create a contact',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v2/receive/contact/new-contact',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a contact',
				action: 'Delete a contact',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v2/receive/contact/delete-contact',
					},
				},
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find a contact by email or LinkedIn',
				action: 'Find a contact',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v2/receive/contact/find-contact',
					},
				},
			},
			{
				name: 'Get Conversion Status',
				value: 'getConversion',
				description: 'Get available conversion statuses',
				action: 'Get conversion statuses',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v2/receive/contact/get-conversion',
					},
				},
			},
			{
				name: 'Get Custom Fields',
				value: 'getCustomFields',
				description: 'Get custom fields configuration',
				action: 'Get custom fields',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v2/receive/contact/get-custom-fields',
					},
				},
			},
			{
				name: 'Get Team',
				value: 'getTeam',
				description: 'Get team members',
				action: 'Get team members',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v2/receive/contact/get-team',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a contact',
				action: 'Update a contact',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v2/receive/contact/edit-contact',
					},
				},
			},
		],
		default: 'create',
	},
];

export const contactFields: INodeProperties[] = [
	// ========== Create ==========
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'First name of the contact',
		routing: {
			send: {
				property: 'first_name',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Last name of the contact',
		routing: {
			send: {
				property: 'last_name',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		typeOptions: {
			email: true,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Email address of the contact',
		routing: {
			send: {
				property: 'email',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City of the contact',
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company of the contact',
			},
			{
				displayName: 'Custom Field Values',
				name: 'customFieldValues',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				description: 'Custom field values (up to 5 fields)',
				options: [
					{
						displayName: 'Values',
						name: 'values',
						values: [
							{
								displayName: 'Field 1',
								name: 'field1',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Field 2',
								name: 'field2',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Field 3',
								name: 'field3',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Field 4',
								name: 'field4',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Field 5',
								name: 'field5',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Job Title',
				name: 'job',
				type: 'string',
				default: '',
				description: 'Job title of the contact',
			},
			{
				displayName: 'LinkedIn',
				name: 'linkedin',
				type: 'string',
				default: '',
				description: 'LinkedIn profile URL',
			},
			{
				displayName: 'List IDs',
				name: 'lists',
				type: 'string',
				default: '',
				description: 'Comma-separated list IDs to assign the contact to',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the contact',
			},
			{
				displayName: 'User IDs',
				name: 'users',
				type: 'string',
				default: '',
				description: 'Comma-separated user IDs to assign the contact to',
			},
		],
	},

	// ========== Update ==========
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the contact to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City of the contact',
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company of the contact',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				typeOptions: {
					email: true,
				},
				default: '',
				description: 'Email address of the contact',
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'First name of the contact',
			},
			{
				displayName: 'Job Title',
				name: 'job',
				type: 'string',
				default: '',
				description: 'Job title of the contact',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Last name of the contact',
			},
			{
				displayName: 'LinkedIn',
				name: 'linkedin',
				type: 'string',
				default: '',
				description: 'LinkedIn profile URL',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the contact',
			},
		],
	},

	// ========== Delete ==========
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['delete'],
			},
		},
		default: '',
		description: 'ID of the contact to delete',
	},

	// ========== Find ==========
	{
		displayName: 'Search By',
		name: 'searchBy',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['find'],
			},
		},
		options: [
			{
				name: 'Email',
				value: 'email',
			},
			{
				name: 'LinkedIn',
				value: 'linkedin',
			},
		],
		default: 'email',
		description: 'Field to search by',
	},
	{
		displayName: 'Search Value',
		name: 'searchValue',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Value to search for',
	},
];