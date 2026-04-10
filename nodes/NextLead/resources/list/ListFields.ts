import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils } from '../../utils/FieldDefinitionUtils';

export const listOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['list'] },
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new list',
				action: 'Create a list',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get many lists',
				action: 'Get many lists',
			},
		],
		default: 'create',
	},
];

const createFields = [
	FieldDefinitionUtils.createStringField({
		name: 'name',
		displayName: 'Name',
		description: 'Name of the list',
		required: true,
		operations: ['create'],
	}),
	FieldDefinitionUtils.createOptionsField({
		name: 'type',
		displayName: 'Type',
		description: 'Type of the list',
		required: false,
		operations: ['create'],
		options: [
			{
				name: 'Regular',
				value: 'REGULAR',
				description: 'A regular list',
			},
			{
				name: 'Audience',
				value: 'AUDIENCE',
				description: 'An audience list',
			},
			{
				name: 'Segment',
				value: 'SEGMENT',
				description: 'A segment list',
			},
			{
				name: 'Prospection',
				value: 'PROSPECTION',
				description: 'A prospection list',
			},
		],
	}),
];

const getManyFields: INodeProperties[] = [];

export const listFields: INodeProperties[] = [
	...createFields,
	...getManyFields,
];
