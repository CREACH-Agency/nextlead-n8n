import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils } from '../../utils/FieldDefinitionUtils';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['group'] },
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new group',
				action: 'Create a group',
			},
		],
		default: 'create',
	},
];

const createFields = [
	FieldDefinitionUtils.createStringField({
		name: 'name',
		displayName: 'Name',
		description: 'Name of the group',
		required: true,
		operations: ['create'],
	}),
	FieldDefinitionUtils.createOptionsField({
		name: 'type',
		displayName: 'Type',
		description: 'Type of the group',
		required: false,
		operations: ['create'],
		options: [
			{
				name: 'Regular',
				value: 'REGULAR',
				description: 'A regular group',
			},
			{
				name: 'Segment',
				value: 'SEGMENT',
				description: 'A segment group',
			},
		],
	}),
	FieldDefinitionUtils.createCollectionField({
		name: 'additionalFields',
		displayName: 'Additional Fields',
		description: 'Additional fields for the group',
		operations: ['create'],
		fields: [
			{
				displayName: 'Description',
				name: 'description',
				description: 'Description of the group',
				default: '',
			},
		],
	}),
];

export const groupFields: INodeProperties[] = [
	...createFields,
];
