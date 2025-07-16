import { INodeProperties } from 'n8n-workflow';

export const salesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sales'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new sale',
				action: 'Create a sale',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a sale',
				action: 'Delete a sale',
			},
			{
				name: 'Get Columns',
				value: 'getColumns',
				description: 'Get available sales columns',
				action: 'Get sales columns',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a sale',
				action: 'Update a sale',
			},
		],
		default: 'create',
	},
];

export const salesFields: INodeProperties[] = [
	// ========== Create ==========
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the contact associated with this sale',
	},
	{
		displayName: 'Column ID',
		name: 'columnId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the sales column (stage)',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the sale',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'Sale amount',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the sale',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{
						name: 'Low',
						value: 'LOW',
					},
					{
						name: 'Normal',
						value: 'NORMAL',
					},
					{
						name: 'High',
						value: 'HIGH',
					},
				],
				default: 'NORMAL',
				description: 'Priority of the sale',
			},
		],
	},

	// ========== Update ==========
	{
		displayName: 'Sale ID',
		name: 'saleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the sale to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'Sale amount',
			},
			{
				displayName: 'Column ID',
				name: 'columnId',
				type: 'string',
				default: '',
				description: 'ID of the sales column (stage)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the sale',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the sale',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{
						name: 'Low',
						value: 'LOW',
					},
					{
						name: 'Normal',
						value: 'NORMAL',
					},
					{
						name: 'High',
						value: 'HIGH',
					},
				],
				default: 'NORMAL',
				description: 'Priority of the sale',
			},
		],
	},

	// ========== Delete ==========
	{
		displayName: 'Sale ID',
		name: 'saleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['delete'],
			},
		},
		default: '',
		description: 'ID of the sale to delete',
	},
];