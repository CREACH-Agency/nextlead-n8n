import { INodeProperties } from 'n8n-workflow';
import { FieldDefinitionUtils } from '../../utils/FieldDefinitionUtils';

export const aiOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['ai'] },
		},
		options: [
			{
				name: 'Run',
				value: 'run',
				description: 'Run a natural language prompt through the NextLead AI agent',
				action: 'Run an AI prompt',
			},
		],
		default: 'run',
	},
];

const runFields: INodeProperties[] = [
	FieldDefinitionUtils.createTextAreaField({
		name: 'prompt',
		displayName: 'Prompt',
		description: 'Natural language instruction for the AI agent (max 8000 characters)',
		required: true,
		rows: 4,
		operations: ['run'],
	}),
	{
		displayName: 'Execute as User',
		name: 'asUserId',
		type: 'resourceLocator',
		required: true,
		displayOptions: {
			show: { operation: ['run'] },
		},
		default: { mode: 'list', value: '' },
		description:
			'Organization member the AI acts on behalf of: writes are attributed to them and their role is enforced',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a member...',
				typeOptions: {
					searchListMethod: 'searchTeamMembers',
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'user-id',
			},
		],
	},
	{
		displayName: 'Allow Mutations',
		name: 'allowMutations',
		type: 'boolean',
		displayOptions: {
			show: { operation: ['run'] },
		},
		default: false,
		description:
			'Whether the AI may write to the CRM (create, update, delete). Disabled by default so a misconfigured workflow stays read-only. The executing member role still applies.',
	},
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'options',
		displayOptions: {
			show: { operation: ['run'] },
		},
		options: [
			{
				name: 'English',
				value: 'en',
			},
			{
				name: 'French',
				value: 'fr',
			},
		],
		default: 'fr',
		description: 'Language the AI answers in',
	},
];

export const aiFields: INodeProperties[] = [...runFields];
