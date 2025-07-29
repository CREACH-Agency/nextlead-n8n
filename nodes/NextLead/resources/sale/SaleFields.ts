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
	// Column field - now just a string input
	FieldDefinitionUtils.createStringField({
		name: 'column',
		displayName: 'Stage',
		description: 'Stage/Column for the sale',
		required: true,
		operations: ['create'],
		placeholder: 'e.g. Prospecting, Negotiation, Closed',
	}),
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
				displayName: 'Stage',
				name: 'column',
				description: 'New stage/column for the sale',
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
	FieldDefinitionUtils.createStringField({
		name: 'name',
		displayName: 'Sale Name',
		description:
			'Name of the specific sale to delete (optional - if not provided, deletes the most recent sale)',
		required: false,
		operations: ['delete'],
	}),
];

export const saleFields: INodeProperties[] = [...createFields, ...updateFields, ...deleteFields];
