import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils } from '../../utils/FieldDefinitionUtils';

export const actionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['action'] },
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
				description: 'Get action columns',
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

const createFields = [
	FieldDefinitionUtils.createStringField({
		name: 'title',
		displayName: 'Title',
		description: 'Title of the action',
		required: true,
		operations: ['create'],
	}),
	{
		displayName: 'Stage Name or ID',
		name: 'column',
		type: 'options' as const,
		required: true,
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['create'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getActionColumns',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	FieldDefinitionUtils.createStringField({
		name: 'assign_contact',
		displayName: 'Assign Contact',
		description: 'Email or LinkedIn URL of contact to assign',
		required: false,
		operations: ['create'],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'additionalFields',
		displayName: 'Additional Fields',
		description: 'Additional fields for the action',
		operations: ['create'],
		fields: [
			{
				displayName: 'Note',
				name: 'note',
				description: 'Action description note',
				default: '',
			},
			{
				displayName: 'Date',
				name: 'date',
				description: 'Date for the action (YYYY-MM-DD)',
				default: '',
				placeholder: '2024-12-31',
			},
			{
				displayName: 'Assigned To',
				name: 'assigned_to',
				description: 'User ID to assign this action to',
				default: '',
			},
		],
	}),
];

const updateFields = [
	FieldDefinitionUtils.createEmailField({
		name: 'contactEmail',
		displayName: 'Contact Email',
		description: 'Email of the contact whose action to update',
		required: true,
		operations: ['update'],
	}),
	{
		displayName: 'Update Logic',
		name: 'updateInfo',
		type: 'notice' as const,
		default: '',
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['update'],
			},
		},
		typeOptions: {
			theme: 'info' as const,
		},
		description: 'If you provide a title, NextLead will try to find an action with that exact title. If not found or no title provided, it will update the most recent action for this contact.',
	},
	FieldDefinitionUtils.createCollectionField({
		name: 'updateFields',
		displayName: 'Update Fields',
		description: 'Fields to update',
		operations: ['update'],
		fields: [
			{
				displayName: 'Title',
				name: 'title',
				description: 'New title for the action',
				default: '',
			},
			{
				displayName: 'Stage Name or ID',
				name: 'column',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getActionColumns',
				},
			},
			{
				displayName: 'Note',
				name: 'note',
				description: 'New note/description',
				default: '',
			},
			{
				displayName: 'Date',
				name: 'date',
				description: 'New date for the action (YYYY-MM-DD)',
				default: '',
				placeholder: '2024-12-31',
			},
			{
				displayName: 'Assigned To',
				name: 'assigned_to',
				description: 'New user ID to assign this action to',
				default: '',
			},
		],
	}),
];

const deleteFields = [
	FieldDefinitionUtils.createEmailField({
		name: 'contactEmail',
		displayName: 'Contact Email',
		description: 'Email of the contact whose action to delete',
		required: true,
		operations: ['delete'],
	}),
	{
		displayName: 'Delete Strategy',
		name: 'deleteStrategy',
		type: 'options' as const,
		options: [
			{
				name: 'Delete Most Recent Action',
				value: 'recent',
				description: 'Delete the most recent action for this contact',
			},
		],
		default: 'recent',
		displayOptions: {
			show: {
				resource: ['action'],
				operation: ['delete'],
			},
		},
		description: 'NextLead API only supports deleting the most recent action per contact',
	},
];

export const actionFields: INodeProperties[] = [
	...createFields,
	...updateFields,
	...deleteFields,
];