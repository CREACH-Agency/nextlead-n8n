import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { ResourceType, OperationType } from '../core/types/NextLeadTypes';
import { IResourceStrategy } from '../core/interfaces/IResourceStrategy';

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
		switch (operation) {
			case 'getMany':
				return [{ json: { message: 'List getMany operation - TODO' } }];
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
