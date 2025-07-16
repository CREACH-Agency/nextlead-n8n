import { INodeProperties } from 'n8n-workflow';

export const actionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['action'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new action',
				action: 'Create an action',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an action',
				action: 'Delete an action',
			},
			{
				name: 'Get Columns',
				value: 'getColumns',
				description: 'Get available action columns',
				action: 'Get action columns',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an action',
				action: 'Update an action',
			},
		],
		default: 'create',
	},
];

export const actionFields: INodeProperties[] = [
	// ========== Create ==========
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the contact associated with this action',
	},
	{
		displayName: 'Column ID',
		name: 'columnId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the action column',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Title of the action',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the action',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'Due date for the action',
			},
			{
				displayName: 'Assigned To',
				name: 'assignedTo',
				type: 'string',
				default: '',
				description: 'User ID to assign the action to',
			},
		],
	},

	// ========== Update ==========
	{
		displayName: 'Action ID',
		name: 'actionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the action to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Assigned To',
				name: 'assignedTo',
				type: 'string',
				default: '',
				description: 'User ID to assign the action to',
			},
			{
				displayName: 'Column ID',
				name: 'columnId',
				type: 'string',
				default: '',
				description: 'ID of the action column',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the action',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'Due date for the action',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title of the action',
			},
		],
	},

	// ========== Delete ==========
	{
		displayName: 'Action ID',
		name: 'actionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['delete'],
			},
		},
		default: '',
		description: 'ID of the action to delete',
	},
];