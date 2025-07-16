import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import {
	contactFields,
	contactOperations,
} from './descriptions/ContactDescription';

import {
	structureFields,
	structureOperations,
} from './descriptions/StructureDescription';

import {
	salesFields,
	salesOperations,
} from './descriptions/SalesDescription';

import {
	actionFields,
	actionOperations,
} from './descriptions/ActionDescription';

import {
	listFields,
	listOperations,
} from './descriptions/ListDescription';

export class NextLead implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NextLead',
		name: 'nextLead',
		icon: 'file:nextlead.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with NextLead CRM API',
		defaults: {
			name: 'NextLead',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'nextLeadApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.domain}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Structure',
						value: 'structure',
					},
					{
						name: 'Sales',
						value: 'sales',
					},
					{
						name: 'Action',
						value: 'action',
					},
					{
						name: 'List',
						value: 'list',
					},
				],
				default: 'contact',
			},
			...contactOperations,
			...contactFields,
			...structureOperations,
			...structureFields,
			...salesOperations,
			...salesFields,
			...actionOperations,
			...actionFields,
			...listOperations,
			...listFields,
		],
	};
}