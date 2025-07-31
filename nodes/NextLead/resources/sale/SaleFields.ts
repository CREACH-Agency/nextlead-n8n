import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils } from '../../utils/FieldDefinitionUtils';

export const saleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['sale'] },
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
				description: 'Get sales stages/columns',
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

const createFields = [
	FieldDefinitionUtils.createStringField({
		name: 'name',
		displayName: 'Name',
		description: 'Name of the sale',
		required: true,
		operations: ['create'],
	}),
	// Column field with dynamic loading
	{
		displayName: 'Stage Name or ID',
		name: 'column',
		type: 'options' as const,
		required: true,
		displayOptions: {
			show: {
				resource: ['sale'],
				operation: ['create'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getSaleColumns',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	FieldDefinitionUtils.createCollectionField({
		name: 'additionalFields',
		displayName: 'Additional Fields',
		description: 'Additional fields for the sale',
		operations: ['create'],
		fields: [
			{
				displayName: 'Description',
				name: 'description',
				description: 'Sale description',
			},
			{
				displayName: 'Value',
				name: 'value',
				description: 'Sale value/amount',
			},
			{
				displayName: 'Success Rate',
				name: 'success_rate',
				description: 'Success rate percentage (0-100)',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				description: 'Sale priority (LOW, NORMAL, HIGH)',
			},
			{
				displayName: 'Close Date',
				name: 'closeDate',
				description: 'Expected close date for the sale (YYYY-MM-DD)',
			},
			{
				displayName: 'Assigned To ID',
				name: 'assignedToId',
				description: 'ID of the user assigned to this sale',
			},
			{
				displayName: 'Contact Email',
				name: 'contact',
				description: 'Email of the contact (will be resolved to contactId)',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				description: 'Direct contact ID (use this or Contact Email)',
			},
		],
	}),
];

const updateFields = [
	FieldDefinitionUtils.createEmailField({
		name: 'contactEmail',
		displayName: 'Contact Email',
		description: 'Email of the contact whose sale to update',
		required: true,
		operations: ['update'],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'updateFields',
		displayName: 'Update Fields',
		description: 'Fields to update',
		operations: ['update'],
		fields: [
			{
				displayName: 'Name',
				name: 'name',
				description: 'Name of the sale',
			},
			{
				displayName: 'Description',
				name: 'description',
				description: 'New description',
			},
			{
				displayName: 'Stage Name or ID',
				name: 'column',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getSaleColumns',
				},
			},
			{
				displayName: 'Value',
				name: 'value',
				description: 'Sale value/amount',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				description: 'Sale priority',
			},
			{
				displayName: 'Success Rate',
				name: 'success_rate',
				description: 'Success rate percentage (0-100)',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
			},
		],
	}),
];

const deleteFields = [
	FieldDefinitionUtils.createEmailField({
		name: 'contactEmail',
		displayName: 'Contact Email',
		description: 'Email of the contact whose sale to delete',
		required: true,
		operations: ['delete'],
	}),
	{
		displayName: 'Delete Strategy',
		name: 'deleteStrategy',
		type: 'options' as const,
		options: [
			{
				name: 'Delete Most Recent Sale',
				value: 'recent',
				description: 'Delete the most recent sale for this contact',
			},
			{
				name: 'Delete Specific Sale by Name',
				value: 'byName',
				description: 'Delete a specific sale by providing its exact name',
			},
		],
		default: 'recent',
		displayOptions: {
			show: {
				resource: ['sale'],
				operation: ['delete'],
			},
		},
		description: 'Choose how to identify which sale to delete',
	},
	{
		displayName: 'Sale Name',
		name: 'name',
		type: 'string' as const,
		default: '',
		displayOptions: {
			show: {
				resource: ['sale'],
				operation: ['delete'],
				deleteStrategy: ['byName'],
			},
		},
		description: 'Exact name of the sale to delete',
		placeholder: 'Enter the exact sale name',
		required: true,
	},
];

export const saleFields: INodeProperties[] = [...createFields, ...updateFields, ...deleteFields];
