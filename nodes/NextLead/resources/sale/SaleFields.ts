import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils } from '../../utils/FieldDefinitionUtils';

/**
 * Currencies NextLead accepts on a sale (`lib/currency.ts` in the CRM). The
 * empty entry leaves the organization default in charge.
 */
const currencyOptions = [
	{ name: '- Default -', value: '' },
	{ name: 'AUD', value: 'AUD' },
	{ name: 'BRL', value: 'BRL' },
	{ name: 'CAD', value: 'CAD' },
	{ name: 'CHF', value: 'CHF' },
	{ name: 'CNY', value: 'CNY' },
	{ name: 'EUR', value: 'EUR' },
	{ name: 'GBP', value: 'GBP' },
	{ name: 'INR', value: 'INR' },
	{ name: 'JPY', value: 'JPY' },
	{ name: 'USD', value: 'USD' },
];

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
				displayName: 'Cost',
				name: 'cost',
				description: 'Cost of the sale, in the sale currency',
				type: 'number' as const,
				default: 0,
			},
			{
				displayName: 'Currency',
				name: 'currency',
				description: 'ISO 4217 code of the sale. Defaults to the sales currency of the organization.',
				type: 'options' as const,
				default: '',
				options: currencyOptions,
			},
			{
				displayName: 'VAT Rate',
				name: 'vat_rate',
				description:
					'VAT rate in percent (0-100). The value stays excluding tax. Defaults to the VAT rate of the organization.',
				type: 'number' as const,
				default: 0,
				typeOptions: { minValue: 0, maxValue: 100 },
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
	FieldDefinitionUtils.createStringField({
		name: 'search_name',
		displayName: 'Search Sale',
		description:
			'Exact name of the sale to update. Used to target the precise sale instead of the most recent one.',
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
				type: 'options' as const,
				default: '',
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
			{
				displayName: 'Cost',
				name: 'cost',
				description: 'Cost of the sale, in the sale currency',
				type: 'number' as const,
				default: 0,
			},
			{
				displayName: 'Currency',
				name: 'currency',
				description: 'ISO 4217 code of the sale. Defaults to the sales currency of the organization.',
				type: 'options' as const,
				default: '',
				options: currencyOptions,
			},
			{
				displayName: 'VAT Rate',
				name: 'vat_rate',
				description:
					'VAT rate in percent (0-100). The value stays excluding tax. Defaults to the VAT rate of the organization.',
				type: 'number' as const,
				default: 0,
				typeOptions: { minValue: 0, maxValue: 100 },
			},
			{
				displayName: 'Close Date',
				name: 'closeDate',
				description: 'Expected close date for the sale (YYYY-MM-DD)',
			},
			{
				displayName: 'Assigned To Name or ID',
				name: 'assignedToId',
				type: 'options' as const,
				default: '',
				typeOptions: { loadOptionsMethod: 'getTeamMembers' },
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
		name: 'search_name',
		displayName: 'Search Sale',
		description:
			'Exact name of the sale to delete. Used to target the precise sale instead of the most recent one.',
		required: true,
		operations: ['delete'],
	}),
];

export const saleFields: INodeProperties[] = [...createFields, ...updateFields, ...deleteFields];
