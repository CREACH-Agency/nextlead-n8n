import { INodeProperties } from 'n8n-workflow';

export const listOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['list'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many lists',
				action: 'Get many lists',
			},
		],
		default: 'getAll',
	},
];

export const listFields: INodeProperties[] = [
	// No additional fields needed for getAll operation
];
