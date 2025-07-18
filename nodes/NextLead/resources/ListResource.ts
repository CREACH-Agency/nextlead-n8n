import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { ResourceType, OperationType, NextLeadCredentials } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';
import { NextLeadApiService } from '../core/NextLeadApiService';

export class ListResource implements IResourceStrategy {
	getResourceType(): ResourceType {
		return 'list';
	}

	getOperations(): INodeProperties[] {
		return [
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
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many lists',
						action: 'Get many lists',
					},
				],
				default: 'getMany',
			},
		];
	}

	getFields(): INodeProperties[] {
		return [
			// Get Many fields (no additional fields needed for lists)
		];
	}

	async execute(
		operation: OperationType,
		context: IExecuteFunctions,
		itemIndex: number,
	): Promise<INodeExecutionData[]> {
		const credentials = await context.getCredentials('nextLeadApi') as NextLeadCredentials;
		const apiService = new NextLeadApiService(credentials);

		switch (operation) {
			case 'getMany':
				return this.handleGetManyLists(context, apiService);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async handleGetManyLists(
		context: IExecuteFunctions,
		apiService: NextLeadApiService,
	): Promise<INodeExecutionData[]> {
		const response = await apiService.getLists(context);

		if (!response.success) {
			throw new Error(`Failed to get lists: ${response.error}`);
		}

		if (Array.isArray(response.data)) {
			return response.data.map(list => ({ json: list }));
		}

		return [{ json: response.data }];
	}
}
