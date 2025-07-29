import { INodeProperties } from 'n8n-workflow';

export const identifyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['identify'] },
		},
		options: [
			{
				name: 'User',
				value: 'user',
				description: 'Verify API key and identify organization',
				action: 'Identify user',
			},
		],
		default: 'user',
	},
];

export const identifyFields: INodeProperties[] = [];
