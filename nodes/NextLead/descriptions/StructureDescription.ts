import { INodeProperties } from 'n8n-workflow';

export const structureOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['structure'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new structure',
				action: 'Create a structure',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a structure',
				action: 'Delete a structure',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all structures',
				action: 'Get all structures',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a structure',
				action: 'Update a structure',
			},
		],
		default: 'create',
	},
];

export const structureFields: INodeProperties[] = [
	// ========== Create ==========
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['structure'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the structure',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['structure'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'Address of the structure',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City of the structure',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'Country of the structure',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				typeOptions: {
					email: true,
				},
				default: '',
				description: 'Email address of the structure',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the structure',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'Postal code of the structure',
			},
			{
				displayName: 'SIRET',
				name: 'siret',
				type: 'string',
				default: '',
				description: 'SIRET number of the structure',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Website URL of the structure',
			},
		],
	},

	// ========== Update ==========
	{
		displayName: 'Structure ID',
		name: 'structureId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['structure'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the structure to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['structure'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'Address of the structure',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City of the structure',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'Country of the structure',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				typeOptions: {
					email: true,
				},
				default: '',
				description: 'Email address of the structure',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the structure',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the structure',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'Postal code of the structure',
			},
			{
				displayName: 'SIRET',
				name: 'siret',
				type: 'string',
				default: '',
				description: 'SIRET number of the structure',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Website URL of the structure',
			},
		],
	},

	// ========== Delete ==========
	{
		displayName: 'Structure ID',
		name: 'structureId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['structure'],
				operation: ['delete'],
			},
		},
		default: '',
		description: 'ID of the structure to delete',
	},
];