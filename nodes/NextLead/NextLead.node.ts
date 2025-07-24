import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	INodeProperties,
	NodeConnectionType,
} from 'n8n-workflow';

import { ResourceManager } from './core/ResourceManager';
import { ContactResource } from './resources/ContactResource';
import { StructureResource } from './resources/StructureResource';
import { SaleResource } from './resources/SaleResource';
import { ActionResource } from './resources/ActionResource';
import { ListResource } from './resources/ListResource';
import { NextLeadErrorHandler } from './core/NextLeadErrorHandler';
import { ResourceType, OperationType } from './core/types/NextLeadTypes';

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
		return manager;
	}

	private getOperations(): INodeProperties[] {
		return NextLead.resourceManager.getAllOperations();
	}

	private getFields(): INodeProperties[] {
		return NextLead.resourceManager.getAllFields();
	}

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
