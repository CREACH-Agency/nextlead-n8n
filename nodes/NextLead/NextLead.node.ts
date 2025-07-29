import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	INodeProperties,
	NodeConnectionType,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import { ResourceManager } from './core/ResourceManager';
import { ContactResource } from './resources/ContactResource';
import { StructureResource } from './resources/StructureResource';
import { SaleResource } from './resources/SaleResource';
import { ActionResource } from './resources/ActionResource';
import { ListResource } from './resources/ListResource';
import { IdentifyResource } from './resources/IdentifyResource';
import { NextLeadErrorHandler } from './core/NextLeadErrorHandler';
import { ResourceType, OperationType } from './core/types/NextLeadTypes';
import { ConversionStatus } from './core/types/shared/ApiTypes';
import { NextLeadCredentials } from './core/types/n8n/RequestTypes';

export class NextLead implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NextLead',
		name: 'nextLead',
		icon: 'file:nextlead.svg',
		/*
		 * - ['trigger']: Node waits for external triggers (webhooks, timers, events)
		 * - []: Empty array for standard nodes
		 *  https://docs.n8n.io/integrations/creating-nodes/build/reference/node-base-files/standard-parameters/#group
		 */
		group: [],
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
						name: 'Action',
						value: 'action',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Identify',
						value: 'identify',
					},
					{
						name: 'List',
						value: 'list',
					},
					{
						name: 'Sale',
						value: 'sale',
					},
					{
						name: 'Structure',
						value: 'structure',
					},
				],
				default: 'contact',
			},
			// Operations will be added dynamically by ResourceManager
			...this.getOperations(),
			// Fields will be added dynamically by ResourceManager
			...this.getFields(),
		],
	};

	private static resourceManager: ResourceManager;

	static {
		NextLead.resourceManager = NextLead.createResourceManager();
	}

	private static createResourceManager(): ResourceManager {
		const manager = new ResourceManager();
		// Register all resource strategies
		manager.register(new ContactResource());
		manager.register(new StructureResource());
		manager.register(new SaleResource());
		manager.register(new ActionResource());
		manager.register(new ListResource());
		manager.register(new IdentifyResource());
		return manager;
	}

	private getOperations(): INodeProperties[] {
		return NextLead.resourceManager.getAllOperations();
	}

	private getFields(): INodeProperties[] {
		return NextLead.resourceManager.getAllFields();
	}

	methods = {
		loadOptions: {
			async getConversionStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = (await this.getCredentials('nextLeadApi')) as NextLeadCredentials;
					// For loadOptions, we'll make a direct HTTP request instead of using the service
					const requestOptions = {
						method: 'GET' as const,
						url: `${credentials.domain}/api/v2/receive/contact/get-conversion`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey}`,
						},
						json: true,
					};

					const response = await this.helpers.request(requestOptions);

					if (Array.isArray(response)) {
						return (response as ConversionStatus[]).map((status) => ({
							name: status.name,
							value: status.id,
						}));
					}

					// If API call fails, return empty array
					// The user must configure conversion statuses in NextLead first
					return [];
				} catch (error) {
					// Return empty array on error
					// The user must configure conversion statuses in NextLead first
					return [];
				}
			},
			async getActionColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = (await this.getCredentials('nextLeadApi')) as NextLeadCredentials;
					const requestOptions = {
						method: 'GET' as const,
						url: `${credentials.domain}/api/v2/receive/actions/get-columns`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey}`,
						},
						json: true,
					};

					const response = await this.helpers.request(requestOptions);

					if (Array.isArray(response)) {
						return response.map((column: { id: string; name: string }) => ({
							name: column.name,
							value: column.id,
						}));
					}

					return [];
				} catch (error) {
					return [];
				}
			},
			async getTeamMembers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = (await this.getCredentials('nextLeadApi')) as NextLeadCredentials;
					const requestOptions = {
						method: 'GET' as const,
						url: `${credentials.domain}/api/v2/receive/contact/get-team`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey}`,
						},
						json: true,
					};

					const response = await this.helpers.request(requestOptions);

					if (Array.isArray(response)) {
						return response.map((member: { id: string; name: string }) => ({
							name: member.name,
							value: member.id,
						}));
					}

					return [];
				} catch (error) {
					return [];
				}
			},
			async getEstablishments(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = (await this.getCredentials('nextLeadApi')) as NextLeadCredentials;
					const requestOptions = {
						method: 'GET' as const,
						url: `${credentials.domain}/api/v2/receive/structure/get-structures`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey}`,
						},
						json: true,
					};

					const response = await this.helpers.request(requestOptions);

					if (Array.isArray(response)) {
						return response.map((structure: { id: string; name: string }) => ({
							name: structure.name,
							value: structure.id,
						}));
					}

					return [];
				} catch (error) {
					return [];
				}
			},
			async getLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = (await this.getCredentials('nextLeadApi')) as NextLeadCredentials;
					const requestOptions = {
						method: 'GET' as const,
						url: `${credentials.domain}/api/v2/receive/lists/get-lists`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey}`,
						},
						json: true,
					};

					const response = await this.helpers.request(requestOptions);

					if (Array.isArray(response)) {
						return response.map((list: { id: string; name: string }) => ({
							name: list.name,
							value: list.id,
						}));
					}

					return [];
				} catch (error) {
					return [];
				}
			},
			async getCustomFieldTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = (await this.getCredentials('nextLeadApi')) as NextLeadCredentials;
					const requestOptions = {
						method: 'GET' as const,
						url: `${credentials.domain}/api/v2/receive/contact/get-custom-fields`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey}`,
						},
						json: true,
					};

					const response = await this.helpers.request(requestOptions);

					if (Array.isArray(response)) {
						return response.map((field: { id: string; name: string; groupName?: string }) => ({
							name: field.groupName ? `${field.groupName} > ${field.name}` : field.name,
							value: field.id,
						}));
					}

					return [];
				} catch (error) {
					return [];
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as ResourceType;
				const operation = this.getNodeParameter('operation', itemIndex) as OperationType;

				const result = await NextLead.resourceManager.execute(resource, operation, this, itemIndex);

				results.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					results.push({ json: NextLeadErrorHandler.formatErrorData(error) });
				} else {
					throw NextLeadErrorHandler.handleApiError(error, this.getNode());
				}
			}
		}

		return [results];
	}
}
